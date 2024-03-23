/* eslint-disable no-void */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { BattleNetworkStopTargeting } from "@providers/battle/network/BattleNetworkStopTargetting";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { GridManager } from "@providers/map/GridManager";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { CharacterSocketEvents, EnvType, ICharacterCreateFromClient, ToGridX, ToGridY } from "@rpg-engine/shared";
import { CharacterView } from "../../CharacterView";

import { BattleTargeting } from "@providers/battle/BattleTargeting";
import { appEnv } from "@providers/config/env";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { ItemMissingReferenceCleaner } from "@providers/item/cleaner/ItemMissingReferenceCleaner";
import { Locker } from "@providers/locks/Locker";
import { QueueCleaner } from "@providers/queue/QueueCleaner";
import { Queue, Worker } from "bullmq";
import { clearCacheForKey } from "speedgoose";
import { CharacterDailyPlayTracker } from "../../CharacterDailyPlayTracker";
import { CharacterValidation } from "../../CharacterValidation";
import { CharacterBuffValidation } from "../../characterBuff/CharacterBuffValidation";
import { CharacterCreateInteractionManager } from "./CharacterCreateInteractionManager";
import { CharacterCreateRegen } from "./CharacterCreateRegen";
import { CharacterCreateSocketHandler } from "./CharacterCreateSocketHandler";

@provideSingleton(CharacterNetworkCreate)
export class CharacterNetworkCreate {
  private queue: Queue<any, any, string> | null = null;
  private worker: Worker | null = null;
  private connection: any;

  private queueName = (scene: string): string =>
    `character-network-create-${appEnv.general.ENV === EnvType.Development ? "dev" : process.env.pm_id}-${scene}`;

  constructor(
    private socketAuth: SocketAuth,

    private battleNetworkStopTargeting: BattleNetworkStopTargeting,
    private gridManager: GridManager,
    private characterView: CharacterView,

    private inMemoryHashTable: InMemoryHashTable,

    private itemMissingReferenceCleaner: ItemMissingReferenceCleaner,
    private characterBuffValidation: CharacterBuffValidation,
    private battleTargeting: BattleTargeting,
    private locker: Locker,

    private characterDailyPlayTracker: CharacterDailyPlayTracker,

    private redisManager: RedisManager,
    private queueCleaner: QueueCleaner,

    private characterValidation: CharacterValidation,

    private characterCreateSocketHandler: CharacterCreateSocketHandler,
    private characterCreateInteractionManager: CharacterCreateInteractionManager,
    private characterCreateRegen: CharacterCreateRegen
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

    const dataFromServer = await this.characterCreateInteractionManager.prepareDataForServer(character, data);
    await Promise.all([
      this.characterCreateInteractionManager.startNPCInteractions(character),
      this.characterCreateInteractionManager.sendCharacterCreateMessages(character, dataFromServer),
      this.characterCreateInteractionManager.warnAboutWeatherStatus(character.channelId!),
      this.characterCreateRegen.handleCharacterRegen(character),
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
}
