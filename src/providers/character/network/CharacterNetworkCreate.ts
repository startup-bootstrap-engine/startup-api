/* eslint-disable no-void */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { MapControlTimeModel } from "@entities/ModuleSystem/MapControlTimeModel";
import { BattleNetworkStopTargeting } from "@providers/battle/network/BattleNetworkStopTargetting";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SpecialEffect } from "@providers/entityEffects/SpecialEffect";
import { ItemView } from "@providers/item/ItemView";
import { GridManager } from "@providers/map/GridManager";
import { NPCManager } from "@providers/npc/NPCManager";
import { NPCWarn } from "@providers/npc/NPCWarn";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import {
  AnimationDirection,
  AvailableWeather,
  CharacterClass,
  CharacterSkullType,
  CharacterSocketEvents,
  ICharacterCreateFromClient,
  ICharacterCreateFromServer,
  IControlTime,
  PeriodOfDay,
  ToGridX,
  ToGridY,
  WeatherSocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { CharacterView } from "../CharacterView";

import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { BattleTargeting } from "@providers/battle/BattleTargeting";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { socketEventsBinderControl } from "@providers/inversify/container";
import { ItemMissingReferenceCleaner } from "@providers/item/cleaner/ItemMissingReferenceCleaner";
import { Locker } from "@providers/locks/Locker";
import { SocketSessionControl } from "@providers/sockets/SocketSessionControl";
import { NumberFormatter } from "@providers/text/NumberFormatter";
import { clearCacheForKey } from "speedgoose";
import { CharacterDeath } from "../CharacterDeath";
import { CharacterBuffTracker } from "../characterBuff/CharacterBuffTracker";
import { CharacterBuffValidation } from "../characterBuff/CharacterBuffValidation";
import { CharacterBaseSpeed } from "../characterMovement/CharacterBaseSpeed";
import { MagePassiveHabilities } from "../characterPassiveHabilities/MagePassiveHabilities";
import { WarriorPassiveHabilities } from "../characterPassiveHabilities/WarriorPassiveHabilities";

@provide(CharacterNetworkCreate)
export class CharacterNetworkCreate {
  constructor(
    private socketAuth: SocketAuth,
    private playerView: CharacterView,
    private socketMessaging: SocketMessaging,
    private itemView: ItemView,
    private battleNetworkStopTargeting: BattleNetworkStopTargeting,
    private npcManager: NPCManager,
    private gridManager: GridManager,
    private npcWarn: NPCWarn,
    private characterView: CharacterView,
    private specialEffect: SpecialEffect,
    private warriorPassiveHabilities: WarriorPassiveHabilities,
    private magePassiveHabilities: MagePassiveHabilities,
    private inMemoryHashTable: InMemoryHashTable,
    private socketSessionControl: SocketSessionControl,

    private characterDeath: CharacterDeath,
    private itemMissingReferenceCleaner: ItemMissingReferenceCleaner,
    private characterBuffValidation: CharacterBuffValidation,
    private battleTargeting: BattleTargeting,
    private locker: Locker,

    private characterBaseSpeed: CharacterBaseSpeed,
    private characterBuffTracker: CharacterBuffTracker,
    private numberFormatter: NumberFormatter
  ) {}

  public onCharacterCreate(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      CharacterSocketEvents.CharacterCreate,
      async (data: ICharacterCreateFromClient, connectionCharacter: ICharacter) => {
        await Character.findOneAndUpdate(
          { _id: connectionCharacter._id },
          {
            target: undefined,
            isOnline: true,
            channelId: data.channelId,
          }
        );

        let character = (await Character.findById(connectionCharacter._id)) as ICharacter;

        if (!character) {
          console.log(`🚫 ${connectionCharacter.name} tried to create its instance but it was not found!`);

          this.socketMessaging.sendEventToUser(data.channelId, CharacterSocketEvents.CharacterForceDisconnect, {
            reason: "Failed to find your character. Please contact the admin on discord.",
          });

          return;
        }

        // update baseSpeed according to skill level

        const { speed: updatedSpeed } = await this.recalculateSpeed(character);

        await clearCacheForKey(`characterBuffs_${character._id}`);

        await this.characterView.clearCharacterView(character);

        await this.itemMissingReferenceCleaner.clearMissingReferences(character);

        await this.inMemoryHashTable.delete("character-weapon", character._id);
        await this.locker.unlock(`character-changing-scene-${character._id}`);

        // refresh battle
        await this.locker.unlock(`character-${character._id}-battle-targeting`);
        await this.battleNetworkStopTargeting.stopTargeting(character);
        await this.battleTargeting.cancelTargeting(character);

        await this.characterBuffValidation.removeDuplicatedBuffs(character);

        const map = character.scene;

        await this.gridManager.setWalkable(map, ToGridX(character.x), ToGridY(character.y), false);

        await this.manageSocketConnections(channel, character);

        if (character.isBanned) {
          console.log(`🚫 ${character.name} tried to create its instance while banned!`);

          this.socketMessaging.sendEventToUser(character.channelId!, CharacterSocketEvents.CharacterForceDisconnect, {
            reason: "You cannot use this character while banned.",
          });

          return;
        }

        if (!character.isAlive) {
          await this.characterDeath.respawnCharacter(character);

          character = (await Character.findById(connectionCharacter._id)) as ICharacter;
        }

        /*
        Here we inject our server side character properties, 
        to make sure the client is not hacking anything
        */

        const dataFromServer: ICharacterCreateFromServer = {
          ...data,
          id: character._id.toString(),
          name: character.name,
          x: character.x!,
          y: character.y!,
          direction: character.direction as AnimationDirection,
          layer: character.layer,
          speed: updatedSpeed,
          movementIntervalMs: character.movementIntervalMs,
          health: character.health,
          maxHealth: character.maxHealth,
          mana: character.mana,
          maxMana: character.maxMana,
          textureKey: character.textureKey,
          alpha: await this.specialEffect.getOpacity(character),
          isGiantForm: character.isGiantForm,
          hasSkull: character.hasSkull,
          skullType: character.skullType as CharacterSkullType,
        };

        void this.npcManager.startNearbyNPCsBehaviorLoop(character);

        void this.npcWarn.warnCharacterAboutNPCsInView(character, { always: true });

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.itemView.warnCharacterAboutItemsInView(character, { always: true }); // dont await this because if there's a ton of garbage in the server, the character will be stuck waiting for this to finish

        await this.sendCreatedMessageToCharacterCreator(data.channelId, dataFromServer);

        await this.sendCreationMessageToCharacters(data.channelId, dataFromServer, character);

        await this.warnAboutWeatherStatus(character.channelId!);

        await this.handleCharacterRegen(character);
      },
      false
    );
  }

  private async manageSocketConnections(channel: SocketChannel, character: ICharacter): Promise<void> {
    const channelId = channel.id?.toString()!;

    const hasSocketConnection = await this.socketSessionControl.hasSession(character._id);

    if (!hasSocketConnection) {
      await channel.join(channelId);
      await this.socketSessionControl.setSession(character._id);

      channel.on("disconnect", async () => {
        await this.socketSessionControl.deleteSession(character._id);
        // @ts-ignore
        channel.removeAllListeners?.(); // make sure we leave no left overs
        await socketEventsBinderControl.unbindEvents(channel);
      });
    }
  }

  private sendCreatedMessageToCharacterCreator(channelId: string, dataFromServer: ICharacterCreateFromServer): void {
    this.socketMessaging.sendEventToUser<ICharacterCreateFromServer>(
      channelId,
      CharacterSocketEvents.CharacterCreate,
      dataFromServer
    );
  }

  @TrackNewRelicTransaction()
  public async sendCreationMessageToCharacters(
    emitterChannelId: string,
    dataFromServer: ICharacterCreateFromServer,
    character: ICharacter
  ): Promise<void> {
    const nearbyCharacters = await this.playerView.getCharactersInView(character);

    if (nearbyCharacters.length > 0) {
      for (const nearbyCharacter of nearbyCharacters) {
        // tell other character that we exist, so it can create a new instance of us
        this.socketMessaging.sendEventToUser<ICharacterCreateFromServer>(
          nearbyCharacter.channelId!,
          CharacterSocketEvents.CharacterCreate,
          dataFromServer
        );

        const nearbyCharacterPayload = {
          id: nearbyCharacter.id.toString(),
          name: nearbyCharacter.name,
          x: nearbyCharacter.x,
          y: nearbyCharacter.y,
          channelId: nearbyCharacter.channelId!,
          direction: nearbyCharacter.direction as AnimationDirection,
          isMoving: false,
          layer: nearbyCharacter.layer,
          speed: nearbyCharacter.speed,
          movementIntervalMs: nearbyCharacter.movementIntervalMs,
          health: nearbyCharacter.health,
          maxHealth: nearbyCharacter.maxHealth,
          mana: nearbyCharacter.mana,
          maxMana: nearbyCharacter.maxMana,
          textureKey: nearbyCharacter.textureKey,
          alpha: await this.specialEffect.getOpacity(nearbyCharacter),
          hasSkull: nearbyCharacter.hasSkull,
          skullType: nearbyCharacter.skullType as CharacterSkullType,
        };

        // tell the emitter about these other characters too

        this.socketMessaging.sendEventToUser<ICharacterCreateFromServer>(
          emitterChannelId,
          CharacterSocketEvents.CharacterCreate,
          nearbyCharacterPayload
        );
      }
    }
  }

  private async warnAboutWeatherStatus(channelId: string): Promise<void> {
    // how we keep only one record in registry, we have just one do find.
    const lastTimeWeatherChanged = await MapControlTimeModel.findOne();
    if (lastTimeWeatherChanged) {
      const dataOfWeather: IControlTime = {
        time: lastTimeWeatherChanged.time,
        period: lastTimeWeatherChanged.period as PeriodOfDay,
        weather: lastTimeWeatherChanged.weather as AvailableWeather,
      };

      this.socketMessaging.sendEventToUser<IControlTime>(
        channelId!,
        WeatherSocketEvents.TimeWeatherControl,
        dataOfWeather
      );
    }
  }

  private async handleCharacterRegen(character: ICharacter): Promise<void> {
    if (!character) {
      return;
    }

    try {
      switch (character.class) {
        case CharacterClass.Warrior:
          await this.warriorPassiveHabilities.warriorAutoRegenHealthHandler(character);

          break;

        case CharacterClass.Druid:
        case CharacterClass.Sorcerer:
          await this.magePassiveHabilities.autoRegenManaHandler(character);

          break;
      }
    } catch (error) {
      console.error(`Error regenerating character ${character._id}: ${error}`);
    }
  }

  private async recalculateSpeed(character: ICharacter): Promise<{ speed: number }> {
    //! temporary ugly hack until we figure out why the hell sometimes the speed bugs out of nowhere

    await this.characterBuffTracker.clearCache(character, "speed");

    const baseSpeed = await this.characterBaseSpeed.getBaseSpeed(character);

    await Character.updateOne(
      {
        _id: character._id,
      },
      {
        baseSpeed,
      }
    );

    return { speed: baseSpeed ?? MovementSpeed.Standard };
  }
}
