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

import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { BattleTargeting } from "@providers/battle/BattleTargeting";
import { appEnv } from "@providers/config/env";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { RedisManager } from "@providers/database/RedisManager";
import { socketEventsBinderControl } from "@providers/inversify/container";
import { ItemMissingReferenceCleaner } from "@providers/item/cleaner/ItemMissingReferenceCleaner";
import { Locker } from "@providers/locks/Locker";
import { QueueCleaner } from "@providers/queue/QueueCleaner";
import { SocketSessionControl } from "@providers/sockets/SocketSessionControl";
import { Stealth } from "@providers/spells/data/logic/rogue/Stealth";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { Queue, Worker } from "bullmq";
import { clearCacheForKey } from "speedgoose";
import { CharacterDailyPlayTracker } from "../CharacterDailyPlayTracker";
import { CharacterDeath } from "../CharacterDeath";
import { CharacterPremiumAccount } from "../CharacterPremiumAccount";
import { CharacterValidation } from "../CharacterValidation";
import { CharacterBuffTracker } from "../characterBuff/CharacterBuffTracker";
import { CharacterBuffValidation } from "../characterBuff/CharacterBuffValidation";
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
    private socketSessionControl: SocketSessionControl,

    private characterDeath: CharacterDeath,
    private itemMissingReferenceCleaner: ItemMissingReferenceCleaner,
    private characterBuffValidation: CharacterBuffValidation,
    private battleTargeting: BattleTargeting,
    private locker: Locker,

    private characterBaseSpeed: CharacterBaseSpeed,
    private characterBuffTracker: CharacterBuffTracker,
    private characterPremiumAccount: CharacterPremiumAccount,
    private characterDailyPlayTracker: CharacterDailyPlayTracker,

    private newRelic: NewRelic,
    private redisManager: RedisManager,
    private queueCleaner: QueueCleaner,

    private characterValidation: CharacterValidation
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
    character = (await Character.findOneAndUpdate(
      { _id: character._id },
      {
        target: undefined,
        isOnline: true,
        channelId: data.channelId,
      },
      { new: true }
    )) as ICharacter;

    const canProceed = this.characterValidation.hasBasicValidation(character);

    if (!canProceed) {
      console.log(`Character ${character._id} failed basic validation on character creation`);
      return;
    }

    await this.characterDailyPlayTracker.updateCharacterDailyPlay(character._id);

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

    /*
    Here we inject our server side character properties,
    to make sure the client is not hacking anything
    */

    const accountType = await this.characterPremiumAccount.getPremiumAccountType(character);

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
      alpha: await this.stealth.getOpacity(character),
      isGiantForm: character.isGiantForm,
      hasSkull: character.hasSkull,
      skullType: character.skullType as CharacterSkullType,
      owner: {
        accountType: accountType ?? UserAccountTypes.Free,
      },
    };

    void this.npcManager.startNearbyNPCsBehaviorLoop(character);

    void this.npcWarn.warnCharacterAboutNPCsInView(character, { always: true });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.itemView.warnCharacterAboutItemsInView(character, { always: true }); // dont await this because if there's a ton of garbage in the server, the character will be stuck waiting for this to finish

    await this.sendCreatedMessageToCharacterCreator(data.channelId, dataFromServer);

    await this.sendCreationMessageToCharacters(data.channelId, dataFromServer, character);

    await this.warnAboutWeatherStatus(character.channelId!);

    await this.handleCharacterRegen(character);
  }

  private async manageSocketConnections(channel: SocketChannel, character: ICharacter): Promise<void> {
    const channelId = channel.id?.toString()!;

    const hasSocketConnection = await this.socketSessionControl.hasSession(character._id);

    if (!hasSocketConnection) {
      await channel.join(channelId);
      await this.socketSessionControl.setSession(character._id);

      channel.on("disconnect", async (reason: string) => {
        await this.socketSessionControl.deleteSession(character._id);
        // @ts-ignore
        channel.removeAllListeners?.(); // make sure we leave no left overs
        await socketEventsBinderControl.unbindEvents(channel);

        // make sure isOnline is turned off

        await Character.updateOne(
          {
            _id: character._id,
          },
          {
            isOnline: false,
            channelId: undefined,
          }
        );

        console.log(`Client disconnected: ${channel.id}, Reason: ${reason}`);

        /*
        transport close: This occurs when the client explicitly closes the connection, such as when a user closes their browser tab or the client application terminates the connection.

        ping timeout: Socket.IO uses heartbeats to ensure the connection is alive. If the server doesn't receive any heartbeat from the client within a certain period, it will close the connection due to a timeout.

        transport error: This indicates a problem with the transport layer, such as network issues or WebSockets being blocked or failing.

        io server disconnect: This is emitted when the server programmatically disconnects the socket using socket.disconnect().

        io client disconnect: This is emitted when the client programmatically disconnects the socket using socket.disconnect().

        client namespace disconnect: Emitted when the client disconnects from a namespace explicitly by calling disconnect() on the namespace.
        */

        // Log the disconnection reason with NewRelic or any other monitoring tool you're using
        this.newRelic.trackMetric(
          NewRelicMetricCategory.Count,
          NewRelicSubCategory.Server,
          `SocketIODisconnect/${reason}`,
          1
        );
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
