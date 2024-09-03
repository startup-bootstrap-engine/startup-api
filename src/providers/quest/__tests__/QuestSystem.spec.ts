/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { IQuest } from "@entities/ModuleQuest/QuestModel";
import { QuestRecord } from "@entities/ModuleQuest/QuestRecordModel";
import { CharacterItems } from "@providers/character/characterItems/CharacterItems";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { FriendlyNPCsBlueprint, HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { InteractionQuestSubtype } from "@providers/unitTests/UnitTestHelper";
import { IItemContainer, QuestStatus, QuestType } from "@rpg-engine/shared";
import { QuestSystem } from "../QuestSystem";

describe("QuestSystem.ts", () => {
  let questSystem: QuestSystem,
    characterItems: CharacterItems,
    testNPC: INPC,
    testCharacter: ICharacter,
    testKillQuest: IQuest,
    testInteractionQuest: IQuest,
    testInteractionCraftQuest: IQuest,
    releaseRewards: jest.SpyInstance;

  const creatureKey = HostileNPCsBlueprint.Orc;
  const npcKey = FriendlyNPCsBlueprint.Alice;
  const objectivesCount = 2;

  beforeAll(() => {
    questSystem = container.get<QuestSystem>(QuestSystem);
    characterItems = container.get<CharacterItems>(CharacterItems);
  });

  beforeEach(async () => {
    resetMocks();
    await setupTestData();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should update quest and release rewards | type kill", async () => {
    await simulateKillQuest();
    const backpackContainer = await getBackpackContainer(testCharacter);
    // @ts-ignore
    expect(backpackContainer?.emptySlotsQty).toBe(backpackContainer?.slotQty - 1);
  });

  it("should update quest and release rewards | type interaction", async () => {
    await questSystem.updateQuests(QuestType.Interaction, testCharacter, npcKey);
    expect(await questSystem.hasStatus(testInteractionQuest, QuestStatus.Completed, testCharacter.id)).toEqual(true);
    expect(releaseRewards).toBeCalledTimes(1);
  });

  it("should update quest and release rewards | type interaction craft - stack remaining", async () => {
    const questItemKeys = [CraftingResourcesBlueprint.Silk, CraftingResourcesBlueprint.Diamond];
    await equipItems(testCharacter, questItemKeys, 10);
    await questSystem.updateQuests(QuestType.Interaction, testCharacter, "");
    expect(await questSystem.hasStatus(testInteractionCraftQuest, QuestStatus.Completed, testCharacter.id)).toEqual(
      true
    );
    expect(releaseRewards).toBeCalledTimes(1);
    await assertRemainingQty(testCharacter, characterItems, questItemKeys, [2, 8]);
  });

  it("should update quest and release rewards | type interaction craft - exact qty, should remove one item", async () => {
    const questItemKeys = [CraftingResourcesBlueprint.Silk, CraftingResourcesBlueprint.Diamond];
    await equipItems(testCharacter, questItemKeys, 8);
    await questSystem.updateQuests(QuestType.Interaction, testCharacter, "");
    expect(await questSystem.hasStatus(testInteractionCraftQuest, QuestStatus.Completed, testCharacter.id)).toEqual(
      true
    );
    expect(releaseRewards).toBeCalledTimes(1);
    await assertRemainingQty(testCharacter, characterItems, questItemKeys, [0, 6]);
  });

  describe("Not update", () => {
    beforeEach(() => {
      // @ts-ignore
      jest.spyOn(QuestRecord, "updateOne").mockImplementation(() => Promise.resolve(null));
    });

    it("should not update quest or release rewards if objectivesData is empty", async () => {
      jest.clearAllMocks();

      jest.spyOn(questSystem as any, "getObjectivesData").mockReturnValueOnce({});
      await questSystem.updateQuests(QuestType.Kill, testCharacter, "some target key");
      expect(releaseRewards).not.toHaveBeenCalled();
    });

    it("should not update quest or release rewards for invalid quest type", async () => {
      await questSystem.updateQuests("invalid quest type" as any, {} as any, "targetKey");
      expect(releaseRewards).not.toHaveBeenCalled();
    });

    it("should not update quest or release rewards if no quest records match status", async () => {
      jest.spyOn(QuestRecord, "find").mockResolvedValueOnce([]);
      await questSystem.updateQuests(QuestType.Interaction, testCharacter, "targetKey");
      expect(QuestRecord.updateOne).not.toHaveBeenCalled();
    });

    it("should not update quest or release rewards if target key does not match objectives", async () => {
      jest.spyOn(questSystem as any, "getObjectivesData").mockReturnValueOnce({
        objectives: [{ targetKey: "key1" }, { targetKey: "key2" }],
        records: [{}],
      });
      await questSystem.updateQuests(QuestType.Interaction, testCharacter, "key3");
      expect(QuestRecord.updateOne).not.toHaveBeenCalled();
    });
  });

  it("should throw an error for invalid quest type", async () => {
    await expect(questSystem.updateQuests("invalid" as QuestType, testCharacter, creatureKey)).rejects.toThrowError(
      "invalid quest type: invalid"
    );
  });

  describe("QuestSystem Edge Cases", () => {
    beforeEach(resetMocks);

    it("should throw an error when updating with an invalid quest type", async () => {
      await expect(questSystem.updateQuests("invalid" as any, testCharacter, "targetKey")).rejects.toThrowError(
        "invalid quest type: invalid"
      );
    });

    it("should return undefined when there are no objectives for kill objective", async () => {
      // @ts-ignore
      const result = await questSystem.updateKillObjective({ objectives: [], records: [] }, "targetKey");
      expect(result).toBeUndefined();
    });

    it("should return empty object if no quest records are found", async () => {
      jest.spyOn(QuestRecord, "find").mockResolvedValueOnce([]);
      // @ts-ignore
      const result = await questSystem.getObjectivesData(testCharacter, QuestType.Kill);
      expect(result).toEqual({});
    });

    it("should return undefined with empty objectives", async () => {
      const objectivesData = { objectives: [], records: [] };
      // @ts-ignore
      const result = await questSystem.updateKillObjective(objectivesData, "targetKey");
      expect(result).toBeUndefined();
    });
  });

  it("should release rewards correctly", async () => {
    const rewardQuest = await unitTestHelper.createMockQuest(testNPC.id, null, {
      rewards: [{ itemKeys: [CraftingResourcesBlueprint.Silk], qty: 1 }],
    });
    await createQuestRecord(rewardQuest, testCharacter);

    const backpackContainer = (await getBackpackContainer(testCharacter)) as unknown as IItemContainer;
    const nonNullSlotsOld = Object.values(backpackContainer.slots).filter((slot) => slot !== null).length;

    await questSystem.updateQuests(QuestType.Interaction, testCharacter, npcKey);

    const updatedBackpackContainer = (await getBackpackContainer(testCharacter)) as unknown as IItemContainer;
    const nonNullSlotsNew = Object.values(updatedBackpackContainer.slots).filter((slot) => slot !== null).length;

    expect(nonNullSlotsNew).toBeGreaterThan(nonNullSlotsOld);
  });

  it("should not complete quest if required items are missing", async () => {
    const itemRequirementQuest = await unitTestHelper.createMockQuest(testNPC.id, null, {
      type: QuestType.Interaction,
      subtype: InteractionQuestSubtype.craft,
      requiredItems: [{ itemKey: CraftingResourcesBlueprint.Diamond, qty: 1 }],
    });
    await createQuestRecord(itemRequirementQuest, testCharacter);

    await questSystem.updateQuests(QuestType.Interaction, testCharacter, npcKey);

    expect(await questSystem.hasStatus(itemRequirementQuest, QuestStatus.InProgress, testCharacter.id)).toBe(true);
  });

  // Helper functions
  function resetMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    releaseRewards = jest.spyOn(questSystem as any, "releaseRewards");
  }

  async function setupTestData() {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasSkills: true,
      hasInventory: true,
    });
    testNPC = await unitTestHelper.createMockNPC();
    testKillQuest = await unitTestHelper.createMockQuest(testNPC.id, { objectivesCount });
    testInteractionQuest = await unitTestHelper.createMockQuest(testNPC.id, { type: QuestType.Interaction });
    testInteractionCraftQuest = await unitTestHelper.createMockQuest(testNPC.id, {
      type: QuestType.Interaction,
      subtype: InteractionQuestSubtype.craft,
    });
    await createQuestRecord(testKillQuest, testCharacter);
    await createQuestRecord(testInteractionQuest, testCharacter);
    await createQuestRecord(testInteractionCraftQuest, testCharacter);
  }

  async function simulateKillQuest() {
    for (let i = 1; i <= 5 * objectivesCount; i++) {
      await questSystem.updateQuests(QuestType.Kill, testCharacter, creatureKey);
      if (i !== 5 * objectivesCount) {
        expect(await questSystem.hasStatus(testKillQuest, QuestStatus.InProgress, testCharacter.id)).toEqual(true);
      } else {
        expect(await questSystem.hasStatus(testKillQuest, QuestStatus.Completed, testCharacter.id)).toEqual(true);
        expect(releaseRewards).toBeCalledTimes(1);
      }
    }
  }

  async function getBackpackContainer(character: ICharacter) {
    const equipment = await Equipment.findById(character.equipment).populate("inventory").exec();
    const backpack = equipment!.inventory as unknown as IItem;
    return await ItemContainer.findById(backpack.itemContainer);
  }

  async function equipItems(character: ICharacter, itemKeys: string[], stackQty: number) {
    const characterEquipment = (await Equipment.findById(character.equipment)
      .populate("inventory")
      .exec()) as IEquipment;
    await unitTestHelper.equipItemsInBackpackSlot(characterEquipment, itemKeys, false, { stackQty });
  }

  async function createQuestRecord(quest: IQuest, character: ICharacter): Promise<void> {
    const objs = await questSystem.getObjectiveDetails(quest);
    for (const obj of objs) {
      const questRecord = new QuestRecord();
      questRecord.quest = quest._id;
      questRecord.character = character._id;
      questRecord.objective = obj._id;
      questRecord.status = QuestStatus.InProgress;
      await questRecord.save();
    }
  }

  async function assertRemainingQty(
    character: ICharacter,
    characterItems: CharacterItems,
    itemKeys: string[],
    expectedQty: number[]
  ): Promise<void> {
    for (const i in itemKeys) {
      const k = itemKeys[i];
      const expQty = expectedQty[i];
      const foundItem = await characterItems.hasItemByKey(k, character, "inventory");
      if (expQty === 0) {
        expect(foundItem).toBeUndefined();
        continue;
      }
      if (!foundItem) {
        throw new Error(`Item with key ${k} not found on characters items`);
      }
      const item = await Item.findById(foundItem.itemId);
      expect(item!.stackQty).toEqual(expQty);
    }
  }
});
