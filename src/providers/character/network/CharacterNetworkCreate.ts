/* eslint-disable no-void */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { MapControlTimeModel } from "@entities/ModuleSystem/MapControlTimeModel";
import { BattleNetworkStopTargeting } from "@providers/battle/network/BattleNetworkStopTargetting";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
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
  EnvType,
  ICharacterCreateFromClient,
  ICharacterCreateFromServer,
  IControlTime,
  PeriodOfDay,
  ToGridX,
  ToGridY,
  UserAccountTypes,
  WeatherSocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { CharacterView } from "../CharacterView";

import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { BattleTargeting } from "@providers/battle/BattleTargeting";
import { appEnv } from "@providers/config/env";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { RedisManager } from "@providers/database/RedisManager";
import { ItemMissingReferenceCleaner } from "@providers/item/cleaner/ItemMissingReferenceCleaner";
import { Locker } from "@providers/locks/Locker";
import { QueueCleaner } from "@providers/queue/QueueCleaner";
import { Stealth } from "@providers/spells/data/logic/rogue/Stealth";
import { Queue, Worker } from "bullmq";
import { clearCacheForKey } from "speedgoose";
import { CharacterDailyPlayTracker } from "../CharacterDailyPlayTracker";
import { CharacterPremiumAccount } from "../CharacterPremiumAccount";
import { CharacterValidation } from "../CharacterValidation";
import { CharacterBuffTracker } from "../characterBuff/CharacterBuffTracker";
import { CharacterBuffValidation } from "../characterBuff/CharacterBuffValidation";
import { CharacterCreateSocketHandler } from "../characterCreate/CharacterCreateSocketHandler";
import { CharacterBaseSpeed } from "../characterMovement/CharacterBaseSpeed";
import { ManaRegen } from "../characterPassiveHabilities/ManaRegen";
import { WarriorPassiveHabilities } from "../characterPassiveHabilities/WarriorPassiveHabilities";

@provide(CharacterNetworkCreate)
export class CharacterNetworkCreate {
  private queue: Queue<any, any, string> | null = null;
  private worker: Worker | null = null;
  private connection: any;

  private queueName = (scene: string): string =>
    `character-network-create-${appEnv.general.ENV === EnvType.Development ? "dev" : process.env.pm_id}-${scene}`;

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
    private stealth: Stealth,
    private warriorPassiveHabilities: WarriorPassiveHabilities,
    private manaRegen: ManaRegen,
    private inMemoryHashTable: InMemoryHashTable,

    private itemMissingReferenceCleaner: ItemMissingReferenceCleaner,
    private characterBuffValidation: CharacterBuffValidation,
    private battleTargeting: BattleTargeting,
    private locker: Locker,

    private characterBaseSpeed: CharacterBaseSpeed,
    private characterBuffTracker: CharacterBuffTracker,
    private characterPremiumAccount: CharacterPremiumAccount,
    private characterDailyPlayTracker: CharacterDailyPlayTracker,

    private redisManager: RedisManager,
    private queueCleaner: QueueCleaner,

    private characterValidation: CharacterValidation,

    private characterCreateSocketHandler: CharacterCreateSocketHandler
  ) {}

  public onCharacterCreate(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      CharacterSocketEvents.CharacterCreate,
      async (data: ICharacterCreateFromClient, connectionCharacter: ICharacter) => {
        await this.execCharacterCreate(connectionCharacter, data, channel);
      },
      false
    );
  }

  private async execCharacterCreate(
    character: ICharacter,
    data: ICharacterCreateFromClient,
    channel: SocketChannel
  ): Promise<void> {
    character = await this.updateCharacterStatus(character, data.channelId);

    if (!this.validateCharacter(character)) {
      return;
    }

    await Promise.all([
      this.characterDailyPlayTracker.updateCharacterDailyPlay(character._id),
      this.clearCharacterCaches(character),
      this.unlockCharacterMapTransition(character),
      this.refreshBattleState(character),
      this.characterBuffValidation.removeDuplicatedBuffs(character),
      this.gridManager.setWalkable(character.scene, ToGridX(character.x), ToGridY(character.y), false),
      this.characterCreateSocketHandler.manageSocketConnections(channel, character),
    ]);

    const dataFromServer = await this.prepareDataForServer(character, data);
    await Promise.all([
      this.startNPCInteractions(character),
      this.sendCharacterCreateMessages(character, dataFromServer),
      this.warnAboutWeatherStatus(character.channelId!),
      this.handleCharacterRegen(character),
    ]);
  }

  private async updateCharacterStatus(character: ICharacter, channelId: string): Promise<ICharacter> {
    return (await Character.findOneAndUpdate(
      { _id: character._id },
      { target: undefined, isOnline: true, channelId },
      { new: true }
    )) as ICharacter;
  }

  private validateCharacter(character: ICharacter): boolean {
    const canProceed = this.characterValidation.hasBasicValidation(character);
    if (!canProceed) {
      console.log(`Character ${character._id} failed basic validation on character creation`);
    }
    return canProceed;
  }

  private async clearCharacterCaches(character: ICharacter): Promise<void> {
    await Promise.all([
      clearCacheForKey(`characterBuffs_${character._id}`),
      this.characterView.clearCharacterView(character),
      this.itemMissingReferenceCleaner.clearMissingReferences(character),
      this.inMemoryHashTable.delete("character-weapon", character._id),
    ]);
  }

  private async unlockCharacterMapTransition(character: ICharacter): Promise<void> {
    await this.locker.unlock(`character-changing-scene-${character._id}`);
  }

  private async refreshBattleState(character: ICharacter): Promise<void> {
    await Promise.all([
      this.locker.unlock(`character-${character._id}-battle-targeting`),
      this.battleNetworkStopTargeting.stopTargeting(character),
      this.battleTargeting.cancelTargeting(character),
    ]);
  }

  private async prepareDataForServer(
    character: ICharacter,
    clientData: ICharacterCreateFromClient
  ): Promise<ICharacterCreateFromServer> {
    const updatedSpeed = (await this.recalculateSpeed(character)).speed;
    const accountType = await this.characterPremiumAccount.getPremiumAccountType(character);

    return {
      ...clientData,
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
      alpha: await this.stealth.getOpacity(character),
      isGiantForm: character.isGiantForm,
      hasSkull: character.hasSkull,
      skullType: character.skullType as CharacterSkullType,
      owner: { accountType: accountType ?? UserAccountTypes.Free },
    };
  }

  private startNPCInteractions(character: ICharacter): void {
    void this.npcManager.startNearbyNPCsBehaviorLoop(character);
    void this.npcWarn.warnCharacterAboutNPCsInView(character, { always: true });
    void this.itemView.warnCharacterAboutItemsInView(character, { always: true }); // Don't await to avoid blocking
  }

  private async sendCharacterCreateMessages(
    character: ICharacter,
    dataFromServer: ICharacterCreateFromServer
  ): Promise<void> {
    this.sendCreatedMessageToCharacterCreator(character.channelId!, dataFromServer);
    await this.sendCreationMessageToCharacters(character.channelId!, dataFromServer, character);
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

        const accountType = await this.characterPremiumAccount.getPremiumAccountType(nearbyCharacter);

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
          alpha: await this.stealth.getOpacity(nearbyCharacter),
          hasSkull: nearbyCharacter.hasSkull,
          skullType: nearbyCharacter.skullType as CharacterSkullType,
          owner: {
            accountType: accountType ?? UserAccountTypes.Free,
          },
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
      if (character.class === CharacterClass.Warrior) {
        await this.warriorPassiveHabilities.warriorAutoRegenHealthHandler(character);
      }
      await this.manaRegen.autoRegenManaHandler(character);
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
