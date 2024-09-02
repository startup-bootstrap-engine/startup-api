/* eslint-disable no-unused-vars */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { container, unitTestHelper } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { recipeSpikedClub } from "@providers/useWith/recipes/maces/tier1/recipeSpikedClub";
import { recipeLifePotion } from "@providers/useWith/recipes/potions/recipeLifePotion";
import { recipeBolt } from "@providers/useWith/recipes/ranged-weapons/ammo/tier1/recipeBolt";
import {
  AnimationEffectKeys,
  AnimationSocketEvents,
  CraftingSkill,
  ICraftItemPayload,
  ItemRarities,
  ItemSocketEvents,
  ItemSubType,
  UISocketEvents,
  UserAccountTypes,
} from "@rpg-engine/shared";
import _ from "lodash";
import { ItemCraftableQueue } from "../ItemCraftableQueue";
import { itemManaPotion } from "../data/blueprints/potions/ItemManaPotion";
import { CraftingResourcesBlueprint, PotionsBlueprint } from "../data/types/itemsBlueprintTypes";

describe("ItemCraftable.ts", () => {
  let craftableItem: ItemCraftableQueue;
  let inventoryContainer: IItemContainer;
  let testCharacter: ICharacter;
  let inventory: IItem;
  let sendEventToUser: jest.SpyInstance;
  let items: IItem[];
  let skill: ISkill;

  beforeAll(() => {
    craftableItem = container.get<ItemCraftableQueue>(ItemCraftableQueue);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(
      { health: 50, mana: 50 },
      { hasEquipment: true, hasInventory: true, hasSkills: true }
    );

    skill = (await Skill.findById(testCharacter.skills).lean()) as ISkill;

    inventory = await testCharacter.inventory;

    inventoryContainer = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

    items = [
      await unitTestHelper.createMockItemFromBlueprint(CraftingResourcesBlueprint.WaterBottle, { stackQty: 1 }),
      await unitTestHelper.createMockItemFromBlueprint(CraftingResourcesBlueprint.DuskwispHerbFlower, { stackQty: 3 }),
    ];

    await unitTestHelper.addItemsToContainer(inventoryContainer, 6, items);

    sendEventToUser = jest.spyOn(SocketMessaging.prototype, "sendEventToUser");

    await testCharacter.populate("skills").execPopulate();

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should load craftable items", async () => {
    // @ts-ignore
    await craftableItem.itemCraftbook.loadCraftableItems(ItemSubType.Potion, testCharacter);

    expect(sendEventToUser).toHaveBeenCalledTimes(1);

    expect(sendEventToUser).toHaveBeenCalledWith(
      testCharacter.channelId!,
      ItemSocketEvents.CraftableItems,
      expect.any(Array)
    );
  });

  it("should craft non stackable item", async () => {
    const craftChanceMock = jest.spyOn(ItemCraftableQueue.prototype as any, "isCraftSuccessful");
    craftChanceMock.mockImplementation(() => {
      return Promise.resolve(true);
    });

    skill.alchemy.level = 10;
    (await Skill.findByIdAndUpdate(skill._id, { ...skill }).lean()) as ISkill;

    await testCharacter.populate("skills").execPopulate();

    const itemToCraft: ICraftItemPayload = { itemKey: itemManaPotion.key! };
    await craftableItem.craftItem(itemToCraft, testCharacter);

    const container = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

    expect(container.slots[1]).toBe(null);

    const potion = container.slots[0];
    expect(potion).not.toBe(null);
    expect(potion.key).toEqual(itemManaPotion.key);
  });

  it("should craft stackable item", async () => {
    skill.lumberjacking.level = 10;
    (await Skill.findByIdAndUpdate(skill._id, { ...skill }).lean()) as ISkill;

    await testCharacter.populate("skills").execPopulate();

    const craftChanceMock = jest.spyOn(ItemCraftableQueue.prototype as any, "isCraftSuccessful");
    craftChanceMock.mockImplementation(() => {
      return Promise.resolve(true);
    });

    await unitTestHelper.addItemsToContainer(inventoryContainer, 6, [
      await unitTestHelper.createMockItemFromBlueprint(CraftingResourcesBlueprint.SmallWoodenStick, { stackQty: 1 }),
      await unitTestHelper.createMockItemFromBlueprint(CraftingResourcesBlueprint.SteelIngot, { stackQty: 1 }),
    ]);

    const itemToCraft: ICraftItemPayload = { itemKey: recipeBolt.outputKey! };
    await craftableItem.craftItem(itemToCraft, testCharacter);

    const container = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

    expect(container.slots[1]).toBe(null);

    const bolt = container.slots[0];

    expect(bolt).not.toBe(null);
    expect(bolt.key).toEqual(recipeBolt.outputKey);
    expect(bolt.stackQty).toBeGreaterThanOrEqual(recipeBolt.outputQtyRange[0]);
    expect(bolt.stackQty).toBeLessThanOrEqual(recipeBolt.outputQtyRange[1]);
  });

  it("should craft item and have Legendary rarity", async () => {
    const craftChanceMock = jest.spyOn(ItemCraftableQueue.prototype as any, "isCraftSuccessful");
    craftChanceMock.mockImplementation(() => {
      return Promise.resolve(true);
    });

    await unitTestHelper.addItemsToContainer(inventoryContainer, 6, [
      await unitTestHelper.createMockItemFromBlueprint(CraftingResourcesBlueprint.IronNail, { stackQty: 10 }),
      await unitTestHelper.createMockItemFromBlueprint(CraftingResourcesBlueprint.WoodenBoard, { stackQty: 4 }),
      await unitTestHelper.createMockItemFromBlueprint(CraftingResourcesBlueprint.Skull, { stackQty: 1 }),
    ]);

    await Skill.findByIdAndUpdate(testCharacter.skills, { blacksmithing: { level: 1000 } });

    const itemToCraft: ICraftItemPayload = { itemKey: recipeSpikedClub.outputKey! };
    await craftableItem.craftItem(itemToCraft, testCharacter);

    const container = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

    expect(container.slots[1]).toBe(null);

    const spikedClub = container.slots[0];

    expect(spikedClub).not.toBe(null);
    expect(spikedClub.key).toEqual(recipeSpikedClub.outputKey);
    expect(spikedClub.rarity).toEqual(ItemRarities.Legendary);
    expect(spikedClub.attack).toEqual(19);
    expect(spikedClub.defense).toEqual(16);
  });

  it("should change character weight", async () => {
    const craftChanceMock = jest.spyOn(ItemCraftableQueue.prototype as any, "isCraftSuccessful");
    craftChanceMock.mockImplementation(() => {
      return Promise.resolve(true);
    });

    skill.alchemy.level = 10;
    (await Skill.findByIdAndUpdate(skill._id, { ...skill }).lean()) as ISkill;

    await testCharacter.populate("skills").execPopulate();

    const originalWeight = testCharacter.weight;
    const itemToCraft: ICraftItemPayload = { itemKey: itemManaPotion.key! };

    await craftableItem.craftItem(itemToCraft, testCharacter);

    const character = await Character.findById(testCharacter._id);
    expect(character!.weight).not.toBe(originalWeight);
  });

  it("should send inventory update event", async () => {
    const craftChanceMock = jest.spyOn(ItemCraftableQueue.prototype as any, "isCraftSuccessful");
    craftChanceMock.mockImplementation(() => true);

    skill.alchemy.level = 10;
    (await Skill.findByIdAndUpdate(skill._id, { ...skill }).lean()) as ISkill;

    await testCharacter.populate("skills").execPopulate();

    const itemToCraft: ICraftItemPayload = { itemKey: itemManaPotion.key! };

    await craftableItem.craftItem(itemToCraft, testCharacter);

    const container = (await ItemContainer.findById(inventory.itemContainer).lean()) as unknown as IItemContainer;

    expect(sendEventToUser).toHaveBeenCalledTimes(5);

    expect(sendEventToUser).toHaveBeenCalledWith(
      testCharacter.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      {
        inventory: container,
        openEquipmentSetOnUpdate: false,
        openInventoryOnUpdate: true,
      }
    );
  });

  it("should call character validation", async () => {
    const performCraftingMock = jest.spyOn(ItemCraftableQueue.prototype as any, "performCrafting");
    performCraftingMock.mockImplementation();

    const characterValidationMock = jest.spyOn(CharacterValidation.prototype, "hasBasicValidation");
    characterValidationMock.mockReturnValue(false);

    skill.alchemy.level = 10;
    (await Skill.findByIdAndUpdate(skill._id, { ...skill }).lean()) as ISkill;

    await testCharacter.populate("skills").execPopulate();

    const itemToCraft: ICraftItemPayload = { itemKey: itemManaPotion.key! };

    await craftableItem.craftItem(itemToCraft, testCharacter);
    expect(performCraftingMock).not.toBeCalled();

    expect(characterValidationMock).toHaveBeenLastCalledWith(testCharacter);

    performCraftingMock.mockReset();
    characterValidationMock.mockReset();
    characterValidationMock.mockReturnValue(true);

    await craftableItem.craftItem(itemToCraft, testCharacter);
    expect(performCraftingMock).toBeCalled();
  });

  it("should not craft item if it does not have skills", async () => {
    // Remove skills from the character
    testCharacter.skills = undefined;
    await testCharacter.save();

    await Skill.findByIdAndDelete(skill._id);

    // Mock the isCraftSuccessful function to always return true
    const craftChanceMock = jest.spyOn(ItemCraftableQueue.prototype as any, "isCraftSuccessful");
    craftChanceMock.mockImplementation(() => {
      return Promise.resolve(true);
    });

    // Define the item to be crafted
    const itemToCraft: ICraftItemPayload = { itemKey: itemManaPotion.key! };

    // Attempt to craft the item
    await craftableItem.craftItem(itemToCraft, testCharacter);

    // Retrieve the item container from the inventory
    const container = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

    // Check if the crafting process has not produced the expected item
    expect(container.slots[1]).not.toBe(null);

    // Retrieve the crafted potion from the container
    const craftedPotion = container.slots[0];

    // Verify that the crafted potion is not the expected item
    expect(craftedPotion).not.toBe(null);
    expect(craftedPotion.key).not.toEqual(itemManaPotion.key);
  });

  it("should not craft without minimum skills", async () => {
    // Mock the isCraftSuccessful function to always return true
    const craftChanceMock = jest.spyOn(ItemCraftableQueue.prototype as any, "isCraftSuccessful");
    craftChanceMock.mockImplementation(() => {
      return Promise.resolve(true);
    });

    skill.alchemy.level = 0;

    await Skill.findByIdAndUpdate(skill._id, { ...skill });

    await testCharacter.populate("skills").execPopulate();

    // Define the item to be crafted
    const itemToCraft: ICraftItemPayload = { itemKey: itemManaPotion.key! };

    // Attempt to craft the item
    await craftableItem.craftItem(itemToCraft, testCharacter);

    // Retrieve the item container from the inventory
    const container = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

    const itemKeys = (await container.items).map((item) => item.key);

    expect(itemKeys.includes(CraftingResourcesBlueprint.WaterBottle)).toBe(true);
    expect(itemKeys.includes(PotionsBlueprint.ManaPotion)).toBe(false);

    expect(sendEventToUser).toHaveBeenCalledTimes(1);
    expect(sendEventToUser).toHaveBeenCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
      message: "Sorry, you do not have the required skills ot craft this item.",
      type: "error",
    });
  });

  it("should not craft item if it does not have a blueprint", async () => {
    const performCraftingMock = jest.spyOn(ItemCraftableQueue.prototype as any, "performCrafting");
    performCraftingMock.mockImplementation();

    const itemToCraft: ICraftItemPayload = { itemKey: "invalid-blueprint-key" };

    await craftableItem.craftItem(itemToCraft, testCharacter);
    expect(performCraftingMock).not.toBeCalled();

    expect(sendEventToUser).toHaveBeenCalledTimes(1);
    expect(sendEventToUser).toHaveBeenCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
      message: "Sorry, this item can not be crafted.",
      type: "error",
    });
  });

  it("should not craft item if it does not have a recipe", async () => {
    const performCraftingMock = jest.spyOn(ItemCraftableQueue.prototype as any, "performCrafting");
    performCraftingMock.mockImplementation();

    const itemToCraft: ICraftItemPayload = { itemKey: CraftingResourcesBlueprint.Wheat };

    await craftableItem.craftItem(itemToCraft, testCharacter);
    expect(performCraftingMock).not.toBeCalled();

    expect(sendEventToUser).toHaveBeenCalledTimes(1);
    expect(sendEventToUser).toHaveBeenCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
      message: "Sorry, this item can not be crafted.",
      type: "error",
    });
  });

  it("should not craft item if character inventory does not have required items", async () => {
    const performCraftingMock = jest.spyOn(ItemCraftableQueue.prototype as any, "performCrafting");
    performCraftingMock.mockImplementation();

    const performTest = async (): Promise<void> => {
      const itemToCraft: ICraftItemPayload = { itemKey: itemManaPotion.key! };
      await craftableItem.craftItem(itemToCraft, testCharacter);

      expect(performCraftingMock).not.toBeCalled();

      expect(sendEventToUser).toHaveBeenCalledTimes(1);
      expect(sendEventToUser).toHaveBeenCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: "Sorry, you do not have required items in your inventory.",
        type: "error",
      });

      performCraftingMock.mockReset();
      sendEventToUser.mockReset();
    };

    await unitTestHelper.addItemsToContainer(inventoryContainer, 6, []);
    await performTest();

    await unitTestHelper.addItemsToContainer(inventoryContainer, 6, [items[0]]);
    await performTest();
  });

  it("should not craft valid item due to crafting failure", async () => {
    const craftChanceMock = jest.spyOn(ItemCraftableQueue.prototype as any, "isCraftSuccessful");

    // @ts-ignore
    const skillIncreaseSpy = jest.spyOn(craftableItem.skillIncrease, "increaseCraftingSP");

    craftChanceMock.mockImplementation(() => false);

    skill.alchemy.level = 10;
    (await Skill.findByIdAndUpdate(skill._id, { ...skill }).lean()) as ISkill;

    await testCharacter.populate("skills").execPopulate();

    const itemToCraft: ICraftItemPayload = { itemKey: itemManaPotion.key! };
    await craftableItem.craftItem(itemToCraft, testCharacter);

    const container = (await ItemContainer.findById(inventory.itemContainer).lean()) as unknown as IItemContainer;

    expect(container.slots[0]).toBe(null);
    expect(container.slots[1]).toBe(null);

    expect(craftChanceMock).toBeCalledTimes(1);
    expect(craftChanceMock).toBeCalledWith(10, 75);

    // expect(skillIncreaseSpy).toBeCalledTimes(1);

    expect(sendEventToUser).toHaveBeenCalledWith(testCharacter.channelId, AnimationSocketEvents.ShowAnimation, {
      targetId: testCharacter._id,
      effectKey: AnimationEffectKeys.Miss,
    });

    expect(sendEventToUser).toHaveBeenCalledWith(
      testCharacter.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      {
        inventory: container,
        openEquipmentSetOnUpdate: false,
        openInventoryOnUpdate: true,
      }
    );
  });

  it("should produce both craft success and failure", async () => {
    const skills = await Skill.findOne({ _id: testCharacter.skills });
    if (skills) {
      const level = 10;
      skills.mining.level = level;
      skills.lumberjacking.level = level - 2;
      skills.cooking.level = level + 4;
      skills.alchemy.level = level - 5;
      await skills.save();
    }

    // @ts-ignore
    const skillsAverage = await craftableItem.getSkillLevel(testCharacter, CraftingSkill.Lumberjacking);

    const results: boolean[] = [];
    for (let i = 0; i < 100; i++) {
      // @ts-ignore
      const result: boolean = craftableItem.isCraftSuccessful(skillsAverage, 50);
      results.push(result);
    }

    expect(results.some((r) => r)).toBeTruthy();
    expect(results.some((r) => !r)).toBeTruthy();
  });

  it("should return crafting skills average", async () => {
    // @ts-ignore
    const avgSkills = await craftableItem.getSkillLevel(testCharacter, CraftingSkill.Lumberjacking);
    expect(typeof avgSkills).toBe("number");
  });

  it("returns a single qty, if item output range is 1:1", async () => {
    // @ts-ignore
    const qtyOutput = await craftableItem.getQty(testCharacter, recipeSpikedClub);

    expect(qtyOutput).toBe(1);
  });

  describe("Premium Account", () => {
    let premiumAccountCharacter: ICharacter;

    beforeEach(async () => {
      premiumAccountCharacter = await unitTestHelper.createMockCharacter(null, {
        isPremiumAccountType: UserAccountTypes.PremiumGold,
      });
    });

    it("should increase crafting qty outcome, if character is on a golden premium account", async () => {
      jest.spyOn(_, "random").mockReturnValue(10);

      // @ts-ignore
      const qtyOutput = await craftableItem.getQty(premiumAccountCharacter, recipeLifePotion);

      expect(qtyOutput).toBe(15);
    });

    it("should return the regular outcome, if character is NOT a premium account", async () => {
      jest.spyOn(_, "random").mockReturnValue(10);

      // @ts-ignore
      const qtyOutput = await craftableItem.getQty(testCharacter, recipeLifePotion);

      expect(qtyOutput).toBe(10);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});
