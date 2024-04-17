/* eslint-disable no-void */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { BattleNetworkStopTargeting } from "@providers/battle/network/BattleNetworkStopTargetting";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { GridManager } from "@providers/map/GridManager";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { CharacterSocketEvents, ICharacterCreateFromClient, ToGridX, ToGridY } from "@rpg-engine/shared";
import { CharacterView } from "../../CharacterView";

import { BattleTargeting } from "@providers/battle/BattleTargeting";
import { CharacterRespawn } from "@providers/character/CharacterRespawn";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { ItemMissingReferenceCleaner } from "@providers/item/cleaner/ItemMissingReferenceCleaner";
import { Locker } from "@providers/locks/Locker";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { clearCacheForKey } from "speedgoose";
import { CharacterDailyPlayTracker } from "../../CharacterDailyPlayTracker";
import { CharacterBuffValidation } from "../../characterBuff/CharacterBuffValidation";
import { CharacterCreateInteractionManager } from "./CharacterCreateInteractionManager";
import { CharacterCreateRegen } from "./CharacterCreateRegen";
import { CharacterCreateSocketHandler } from "./CharacterCreateSocketHandler";

@provideSingleton(CharacterNetworkCreateQueue)
export class CharacterNetworkCreateQueue {
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

    private characterCreateSocketHandler: CharacterCreateSocketHandler,
    private characterCreateInteractionManager: CharacterCreateInteractionManager,
    private characterCreateRegen: CharacterCreateRegen,
    private characterRespawn: CharacterRespawn,
    private dynamicQueue: DynamicQueue
  ) {}

  public onCharacterCreate(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      CharacterSocketEvents.CharacterCreate,
      async (data: ICharacterCreateFromClient, connectionCharacter: ICharacter) => {
        await this.characterCreate(connectionCharacter, data, channel);
      },
      false
    );
  }

  public async characterCreate(
    character: ICharacter,
    data: ICharacterCreateFromClient,
    channel: SocketChannel
  ): Promise<void> {
    await this.dynamicQueue.addJob(
      "character-create",
      async (job) => {
        const { character, data } = job.data;

        await this.execCharacterCreate(character, data);
      },
      { character, data }
    );

    await this.characterCreateSocketHandler.manageSocketConnections(channel, character);
  }

  private async execCharacterCreate(character: ICharacter, data: ICharacterCreateFromClient): Promise<void> {
    await this.clearCharacterCaches(character);

    character = await this.updateCharacterStatus(character, data.channelId);

    character = await this.respawnIfNecessary(character);

    await Promise.all([
      this.characterDailyPlayTracker.updateCharacterDailyPlay(character._id),
      this.unlockCharacterMapTransition(character),
      this.refreshBattleState(character),
      this.characterBuffValidation.removeDuplicatedBuffs(character),
      this.gridManager.setWalkable(character.scene, ToGridX(character.x), ToGridY(character.y), false),
    ]);

    const dataFromServer = await this.characterCreateInteractionManager.prepareDataForServer(character, data);

    await this.characterCreateInteractionManager.startNPCInteractions(character);
    await Promise.all([
      this.characterCreateInteractionManager.sendCharacterCreateMessages(character, dataFromServer),
      this.characterCreateInteractionManager.warnAboutWeatherStatus(character.channelId!),
      this.characterCreateRegen.handleCharacterRegen(character),
    ]);
  }

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
  }

  private async respawnIfNecessary(character: ICharacter): Promise<ICharacter> {
    if (character.health <= 0) {
      character = await this.characterRespawn.respawnCharacter(character, { isOnline: true });

      return character;
    }

    return character;
  }

  private async updateCharacterStatus(character: ICharacter, channelId: string): Promise<ICharacter> {
    return (await Character.findOneAndUpdate(
      { _id: character._id },
      { target: undefined, isOnline: true, channelId },
      { new: true }
    )) as ICharacter;
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
