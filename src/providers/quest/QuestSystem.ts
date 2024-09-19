/* eslint-disable mongoose-lean/require-lean */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment } from "@entities/ModuleCharacter/EquipmentModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem as IItemModel, Item } from "@entities/ModuleInventory/ItemModel";
import { IQuest, Quest } from "@entities/ModuleQuest/QuestModel";

import {
  IQuestObjectiveInteraction,
  IQuestObjectiveKill,
  QuestObjectiveInteraction,
  QuestObjectiveKill,
} from "@entities/ModuleQuest/QuestObjectiveModel";
import { IQuestRecord, QuestRecord } from "@entities/ModuleQuest/QuestRecordModel";
import { IQuestReward, QuestReward } from "@entities/ModuleQuest/QuestRewardModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterItems, IItemByKeyResult } from "@providers/character/characterItems/CharacterItems";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { EquipmentSlots } from "@providers/equipment/EquipmentSlots";
import { blueprintManager } from "@providers/inversify/container";
import { AvailableBlueprints } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemDrop } from "@providers/item/ItemDrop/ItemDrop";
import { Locker } from "@providers/locks/Locker";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  IEquipmentAndInventoryUpdatePayload,
  IItem,
  IItemContainer,
  IQuestsResponse,
  ItemSocketEvents,
  IUIShowMessage,
  QuestSocketEvents,
  QuestStatus,
  QuestType,
  UISocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";
import { Types } from "mongoose";

interface IGetObjectivesResult {
  objectives: IQuestObjectiveInteraction[] | IQuestObjectiveKill[];
  records: IQuestRecord[];
}

interface IConsumeCharacterItem extends IItemByKeyResult {
  isStackable?: boolean;
  decrementQty?: number;
}

@provide(QuestSystem)
export class QuestSystem {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterWeight: CharacterWeightQueue,
    private equipmentSlots: EquipmentSlots,
    private movementHelper: MovementHelper,
    private itemDrop: ItemDrop,
    private characterItems: CharacterItems,
    private locker: Locker
  ) {}

  @TrackNewRelicTransaction()
  public async updateQuests(type: QuestType, character: ICharacter, targetKey: string): Promise<void> {
    const lockKey = `update-quests-${character.id}`;
    const canProceed = await this.locker.lock(lockKey);

    if (!canProceed) {
      return;
    }

    try {
      const objectivesData = await this.getObjectivesData(character, type);
      if (_.isEmpty(objectivesData)) {
        return;
      }

      let updatedQuest: IQuest | undefined;
      switch (type) {
        case QuestType.Kill:
          updatedQuest = await this.updateKillObjective(objectivesData, targetKey);
          break;
        case QuestType.Interaction:
          updatedQuest = await this.updateInteractionObjective(objectivesData, targetKey, character);
          break;
        default:
          throw new Error(`Invalid quest type ${type}`);
      }

      if (updatedQuest) {
        const isCompleted = await this.hasStatus(updatedQuest, QuestStatus.Completed, character.id);
        if (isCompleted) {
          await this.releaseRewards(updatedQuest, character);
        }
      }
    } catch (err) {
      console.log(err);
      throw new Error(err.message || "An unexpected error occurred");
    } finally {
      await this.locker.unlock(lockKey);
    }
  }

  public async hasStatus(quest: IQuest, status: QuestStatus, characterId: string): Promise<boolean> {
    const objectives = await this.getObjectiveDetails(quest);
    if (!objectives.length) {
      throw new Error(`Quest with id ${quest.id} does not have objectives`);
    }
    const recordData =
      (await QuestRecord.find({
        character: Types.ObjectId(characterId),
        quest: quest._id,
      }).lean()) || [];
    // Case pending && completed ==> All should be same state
    // Case in progress ==> With 1 in progress is inProgress state
    // Case in progress ==> With 1 completed and 1 pending, is also inProgress state
    let currentStatus = QuestStatus.Pending;
    for (let i = 0; i < recordData.length; i++) {
      const obj = recordData[i];
      if (i === 0) {
        currentStatus = obj.status as QuestStatus;
        continue;
      }

      if (obj.status === QuestStatus.InProgress) {
        currentStatus = obj.status;
        break;
      }

      if (
        (currentStatus === QuestStatus.Pending && obj.status === QuestStatus.Completed) ||
        (currentStatus === QuestStatus.Completed && obj.status === QuestStatus.Pending)
      ) {
        currentStatus = QuestStatus.InProgress;
        break;
      }
    }

    // reapeatable quests can be done again if are completed
    if (currentStatus === QuestStatus.Completed && status === QuestStatus.Pending && quest.canBeRepeated) {
      return true;
    }

    return currentStatus === status;
  }

  public async getObjectiveDetails(quest: IQuest): Promise<IQuestObjectiveKill[] | IQuestObjectiveInteraction[]> {
    const killObj = (await QuestObjectiveKill.find({
      _id: { $in: quest.objectives },
    }).lean()) as any[];

    const interactionObj = (await QuestObjectiveInteraction.find({
      _id: { $in: quest.objectives },
    }).lean()) as any[];

    const objectives: any[] = [];

    if (!_.isEmpty(killObj)) {
      objectives.push(...killObj);
    }

    if (!_.isEmpty(interactionObj)) {
      objectives.push(...interactionObj);
    }

    return objectives;
  }

  private async getObjectivesData(
    character: ICharacter,
    type: QuestType,
    status = QuestStatus.InProgress
  ): Promise<IGetObjectivesResult> {
    const questRecords = await QuestRecord.find({ character: character.id, status });

    if (!questRecords.length) {
      return {} as IGetObjectivesResult;
    }

    switch (type) {
      case QuestType.Interaction:
        return {
          objectives: await QuestObjectiveInteraction.find({
            _id: { $in: questRecords.map((r) => r.objective) },
          }),
          records: questRecords,
        };

      case QuestType.Kill:
        return {
          objectives: await QuestObjectiveKill.find({
            _id: { $in: questRecords.map((r) => r.objective) },
          }),
          records: questRecords,
        };
      default:
        throw new Error(`invalid quest type: ${type}`);
    }
  }

  /**
   * This function updates the kill objective of a quest if creatureKey is
   * within the creatureKey array of one of the objectives. In such case,
   * returns the quest that is owner to the updated objective. If none is updated,
   * returns undefined
   *
   * @param data quest objective data for the character
   * @param creatureKey key of the creature killed
   */
  private async updateKillObjective(data: IGetObjectivesResult, creatureKey: string): Promise<IQuest | undefined> {
    const baseCreatureKey = creatureKey.replace(/-\d+$/, "");

    for (const obj of data.objectives) {
      const killObjective = obj as IQuestObjectiveKill;
      if (killObjective.creatureKeys!.includes(baseCreatureKey)) {
        const record = data.records.find((r) => r.objective.toString() === killObjective._id.toString());
        if (!record) {
          throw new Error("Character hasn't started this quest");
        }

        const prevKillCount = record.killCount || 0;

        const newKillCount = prevKillCount + 1;

        const newStatus = newKillCount === killObjective.killCountTarget ? QuestStatus.Completed : record.status;

        const updatedRecord = await QuestRecord.findOneAndUpdate(
          { _id: record._id },
          {
            $inc: { killCount: 1 },
            $set: { status: newStatus },
          },
          { new: true, lean: true }
        );

        if (updatedRecord) {
          return (await Quest.findById(updatedRecord.quest).lean()) as IQuest;
        }
      }
    }
    return undefined;
  }

  /**
   * This function updates the interaction objective of a quest if npcKey is
   * equal to the targetNPCkey of one of the objectives. In such case,
   * returns the quest that is owner to the updated objective. If none is updated,
   * returns undefined
   *
   * @param data objectives data of interaction objectives
   * @param npcKey key of npc that the charater interacted with
   * @param character character data used to check if has required items in case the interaction quest has defined 'itemsKeys' field
   */
  private async updateInteractionObjective(
    data: IGetObjectivesResult,
    npcKey: string,
    character: ICharacter
  ): Promise<IQuest | undefined> {
    npcKey = this.stripTrailingNumbers(npcKey);

    // check for each objective if the npc key is the correspondiong npc
    // If many cases, only update the first one
    for (const i in data.objectives) {
      let objCompleted = false;

      const obj = data.objectives[i] as IQuestObjectiveInteraction;

      // get the quest record for the character
      const record = data.records.filter((r) => r?.objective?.toString() === obj?._id?.toString());
      if (!record.length) {
        throw new Error("Character hasn't started this quest");
      }

      if (obj.targetNPCkey! === npcKey) {
        objCompleted = true;
      }
      // check if the obj has 'items' field defined
      // then check if character has the required items to complete the quest

      if (!_.isEmpty(obj.items)) {
        const foundItems: IConsumeCharacterItem[] = [];
        for (const i of obj.items!) {
          // if does not have all items, no update is done

          const foundItem = (await this.characterItems.hasItemByKey(i.itemKey, character, "both")) as
            | IConsumeCharacterItem
            | undefined;
          if (!foundItem) {
            const itemBlueprint = await blueprintManager.getBlueprint<IItem>("items", i.itemKey as AvailableBlueprints);

            this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
              message: `You don't have the required items to complete this quest. Required items: ${i.qty}x - ${itemBlueprint.name}`,
              type: "info",
            });
            return;
          }
          const item = await Item.findById(foundItem.itemId);
          // if is stackable item and does not have the required amount, no update is done
          if (i.qty > 1 && (!item?.maxStackSize || (item?.stackQty || 0) < i.qty)) {
            return;
          }
          foundItem.isStackable = !!item?.maxStackSize;
          foundItem.decrementQty = i.qty;
          foundItems.push(foundItem);
        }

        // character contains all items
        // remove them from the character's equipment and set obj as completed
        for (const found of foundItems) {
          let removed = false;
          // for stackable items, remove only the corresponding qty
          if (found.isStackable) {
            removed = await this.characterItems.decrementItemFromContainer(
              found.itemId!,
              character,
              // @ts-ignore
              found.container,
              found.decrementQty
            );
          } else {
            removed = await this.characterItems.deleteItemFromContainer(
              found.itemId!,
              character,
              // @ts-ignore
              found.container
            );
          }
          if (!removed) {
            return;
          }
        }
        // delete if corresponds (no stackable items)
        await Item.deleteMany({ _id: { $in: foundItems.filter((i) => !i.isStackable).map((i) => i.itemId) } });
        objCompleted = true;
      }

      if (objCompleted) {
        // update the quest status to Completed
        record[0].status = QuestStatus.Completed;
        await record[0].save();
        return (await Quest.findById(record[0].quest)) as IQuest;
      }
    }
    return undefined;
  }

  private stripTrailingNumbers(npcKey: string): string {
    return npcKey.replace(/-\d+$/, "");
  }

  private async releaseRewards(quest: IQuest, character: ICharacter): Promise<void> {
    // Verify the quest is completed before releasing rewards
    const isQuestCompleted = await this.hasStatus(quest, QuestStatus.Completed, character.id);
    if (!isQuestCompleted) {
      return;
    }

    const rewards = await QuestReward.find({ _id: { $in: quest.rewards } });

    // Get character's backpack to store there the rewards
    // TODO: Cache this
    const equipment = await Equipment.findById(character.equipment).populate("inventory").exec();
    if (!equipment) {
      throw new Error(
        `Character equipment not found. Character id ${character.id}, Equipment id ${character.equipment}`
      );
    }
    const backpack = equipment.inventory as unknown as IItem;

    if (!backpack) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "You don't have a backpack to store the rewards");
      return;
    }

    const backpackContainer = await ItemContainer.findById(backpack.itemContainer);

    if (!backpackContainer) {
      throw new Error(
        `Character item container not found. Character id ${character.id}, ItemContainer id ${backpack.itemContainer}`
      );
    }

    try {
      const overflowingRewards: IItemModel[] = [];
      for (const reward of rewards) {
        overflowingRewards.push(
          ...(await this.releaseItemRewards(reward, backpackContainer as unknown as IItemContainer))
        );
        // TODO implement when spells are supported
        // await this.releaseSpellRewards(reward, backpackContainer);
      }

      if (!_.isEmpty(overflowingRewards)) {
        // drop items on the floor
        // 1. get nearby grid points without solids
        const gridPoints = await this.movementHelper.getNearbyGridPoints(character, overflowingRewards.length);
        // 2. drop items on those grid points
        await this.itemDrop.dropItems(overflowingRewards, gridPoints, character.scene);
      }

      backpackContainer.markModified("slots");
      await backpackContainer.save();

      await this.characterWeight.updateCharacterWeight(character);

      const equipmentSlots = await this.equipmentSlots.getEquipmentSlots(
        character._id,
        character.equipment!.toString()
      );

      const inventory: IItemContainer = {
        _id: backpackContainer._id,
        parentItem: backpackContainer.parentItem.toString(),
        owner: backpackContainer.owner?.toString() || character.name,
        name: backpackContainer.name,
        slotQty: backpackContainer.slotQty,
        slots: backpackContainer.slots,
        isEmpty: backpackContainer.isEmpty,
      };

      const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
        equipment: equipmentSlots,
        inventory: inventory,
        openEquipmentSetOnUpdate: false,
        openInventoryOnUpdate: true,
      };

      this.sendQuestCompletedEvents(quest, character, payloadUpdate);
    } catch (err) {
      console.log(err);
      throw new Error("An unexpected error ocurred, check the logs for more information");
    }
  }

  /**
   * Release the rewards in character's item container
   * If no more space left, returns an array with the overflowing items
   * @param reward quest reward data
   * @param itemContainer character's item container
   * @returns array of overflowing reward items that could not be placed on charater's item container
   */
  private async releaseItemRewards(reward: IQuestReward, itemContainer: IItemContainer): Promise<IItemModel[]> {
    const overflowingRewards: IItemModel[] = [];
    if (!reward.itemKeys) {
      return overflowingRewards;
    }

    for (const itemKey of reward.itemKeys) {
      const blueprintData = await blueprintManager.getBlueprint<IItem>("items", itemKey as AvailableBlueprints);

      for (let i = 0; i < reward.qty; i++) {
        let rewardItem = new Item({ ...blueprintData, owner: itemContainer.owner });

        if (rewardItem.maxStackSize > 1) {
          if (reward.qty > rewardItem.maxStackSize) {
            throw new Error(
              `Loot quantity of ${rewardItem.key} is higher than max stack size for item ${rewardItem.name}, which is ${rewardItem.maxStackSize}`
            );
          }

          rewardItem.stackQty = reward.qty;
        }

        rewardItem = await rewardItem.save();

        const freeSlotId = itemContainer.firstAvailableSlotId;
        const freeSlotAvailable = freeSlotId !== null;

        if (!freeSlotAvailable) {
          // if character has no more space on backpack
          // return the remaining reward items
          overflowingRewards.push(rewardItem);
        } else {
          itemContainer.slots[freeSlotId!] = rewardItem as unknown as IItem;
        }

        if (rewardItem.maxStackSize > 1) {
          break;
        }
      }
    }
    return overflowingRewards;
  }

  private sendQuestCompletedEvents(
    quest: IQuest,
    character: ICharacter,
    payloadUpdate: IEquipmentAndInventoryUpdatePayload
  ): void {
    this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
      message: `You have completed the quest '${quest.title}'!`,
      type: "info",
    });

    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );

    this.socketMessaging.sendEventToUser<IQuestsResponse>(character.channelId!, QuestSocketEvents.Completed, {
      npcId: quest.npcId!.toString(),
      quests: [quest as any],
    });
  }

  private releaseSpellRewards(reward: IQuestReward, itemContainer: IItemContainer): void {
    /*
     * TODO: implement when spells are supported
     */
  }
}
