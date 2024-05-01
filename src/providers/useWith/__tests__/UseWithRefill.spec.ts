import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { container, unitTestHelper } from "@providers/inversify/container";
import { ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { PlantItemBlueprint } from "@providers/plant/data/types/PlantTypes";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { IRefillableItem, ItemType, MapLayers, UseWithSocketEvents } from "@rpg-engine/shared";
import { IUseWithRefill, UseWithRefill } from "../abstractions/UseWithRefill";
import { IUseWithTargetTile } from "../useWithTypes";

describe("UseWithRefill.ts", () => {
  let useWithRefill: UseWithRefill;
  let useWithRefillData: IUseWithRefill;
  let testCharacter: ICharacter;
  let testRefillItem: IItem;
  let testPlant: IItem;
  let testRefillItemBlueprint: IRefillableItem;
  let inventory: IItem;
  let inventoryContainer: IItemContainer;
  let blueprintManager: BlueprintManager;
  let skillIncrease: SkillIncrease;
  let resourceKey: string;
  let sendSimpleTutorialEvent: jest.SpyInstance;

  const mockSocketMessaging = {
    sendMessageToCharacter: jest.fn(),
    sendErrorMessageToCharacter: jest.fn(),
    sendEventToUser: jest.fn(),
  };

  beforeAll(() => {
    useWithRefill = container.get<UseWithRefill>(UseWithRefill);
    skillIncrease = container.get<SkillIncrease>(SkillIncrease);
    blueprintManager = container.get<BlueprintManager>(BlueprintManager);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true, hasInventory: true });

    testRefillItem = await unitTestHelper.createMockItemFromBlueprint(ToolsBlueprint.WateringCan);

    testPlant = await unitTestHelper.createMockItemFromBlueprint(PlantItemBlueprint.Cabbage);
    testPlant.type = ItemType.Plant;
    testPlant.x = 0;
    testPlant.y = 0;
    testPlant.owner = testCharacter._id;
    await testPlant.save();

    inventory = await testCharacter.inventory;

    inventoryContainer = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

    await unitTestHelper.addItemsToContainer(inventoryContainer, 1, [testRefillItem]);

    testRefillItemBlueprint = await blueprintManager.getBlueprint<IRefillableItem>("items", testRefillItem.baseKey);

    resourceKey = testRefillItemBlueprint.refillResourceKey;

    useWithRefillData = {
      targetItem: testPlant,
      originItem: testRefillItem,
      targetTile: {
        x: 0,
        y: 0,
        map: "example",
        layer: "ground" as unknown as MapLayers,
      } as unknown as IUseWithTargetTile,
      decrementQty: 1,
      targetType: ItemType.Plant,
      successMessages: ["your success"],
    };

    // @ts-ignore
    sendSimpleTutorialEvent = jest.spyOn(useWithRefill.simpleTutorial, "sendSimpleTutorialActionToCharacter");

    // @ts-ignore
    useWithRefill.socketMessaging = mockSocketMessaging;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should sends an error message when the target item is not found", async () => {
    useWithRefillData.targetItem = undefined;
    await useWithRefill.executeUse(testCharacter, useWithRefillData, skillIncrease);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
      testCharacter,
      "Sorry, item you are trying to use was not found."
    );
  });

  it("should sends an error message when the blueprint is not found", async () => {
    // @ts-ignore
    useWithRefillData.originItem = undefined;

    await useWithRefill.executeUse(testCharacter, useWithRefillData, skillIncrease);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
      testCharacter,
      "Sorry, the blueprint could not be found."
    );
  });

  it("should sends an error message when the target is out of reach", async () => {
    testCharacter.x = 100;
    testCharacter.y = 100;

    await useWithRefill.executeUse(testCharacter, useWithRefillData, skillIncrease);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
      testCharacter,
      "Sorry, your target is out of reach."
    );
  });

  it("should sends an error message when the origin item needs refilling", async () => {
    testRefillItem.remainingUses = 0;

    await useWithRefill.executeUse(testCharacter, useWithRefillData, skillIncrease);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
      testCharacter,
      `Sorry, Please refill your tool on a ${resourceKey} source.`
    );
  });

  it("should sends an error message for invalid target type", async () => {
    testPlant.type = ItemType.Other;

    await useWithRefill.executeUse(testCharacter, useWithRefillData, skillIncrease);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
      testCharacter,
      `Sorry, only ${useWithRefillData.targetType}s can be ${resourceKey}.`
    );
  });

  it("should sends an error message for non-owner trying to use the item", async () => {
    // @ts-ignore
    testPlant.owner = undefined;

    await useWithRefill.executeUse(testCharacter, useWithRefillData, skillIncrease);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
      testCharacter,
      `Sorry, You can only ${resourceKey} ${useWithRefillData.targetType}s that you own.`
    );
  });

  it("should properly water if all conditions are met", async () => {
    // @ts-expect-error
    const sendRandomMessageToCharacterMock = jest.spyOn(useWithRefill, "sendRandomMessageToCharacter");

    // @ts-expect-error
    jest.spyOn(useWithRefill.plantGrowth, "updatePlantGrowth").mockResolvedValue(true);

    const mockIncreaseCraftingSP = jest.fn();
    const mockSkillIncrease = { increaseCraftingSP: mockIncreaseCraftingSP };

    const currentRemainingUses = testRefillItem.remainingUses ?? 10;

    const decrementQty = useWithRefillData.decrementQty ?? 1;
    // @ts-ignore
    await useWithRefill.executeUse(testCharacter, useWithRefillData, mockSkillIncrease);

    const updatedRefillItem = await Item.findById(testRefillItem.id);

    expect(mockIncreaseCraftingSP).toBeCalledWith(testCharacter, ItemType.Plant, true);

    expect(updatedRefillItem?.remainingUses).toEqual(currentRemainingUses - decrementQty);

    expect(sendRandomMessageToCharacterMock).toBeCalledWith(
      testCharacter,
      useWithRefillData.successMessages,
      true,
      expect.any(Object)
    );

    expect(mockSocketMessaging.sendEventToUser).toBeCalledWith(
      testCharacter.channelId!,
      UseWithSocketEvents.UseWithWater,
      {
        status: true,
      }
    );

    expect(sendSimpleTutorialEvent).toBeCalledWith(testCharacter!, "plant-water");
  });

  it("should not send sendRandomMessageToCharacter when updatePlantGrowth returns false", async () => {
    // @ts-ignore
    jest.spyOn(useWithRefill.plantGrowth, "updatePlantGrowth").mockImplementation(() => false);

    // @ts-expect-error
    const sendRandomMessageToCharacterMock = jest.spyOn(useWithRefill, "sendRandomMessageToCharacter");

    await useWithRefill.executeUse(testCharacter, useWithRefillData, skillIncrease);

    expect(sendRandomMessageToCharacterMock).not.toBeCalled();
  });

  it("should sends an error message when plan is already dead", async () => {
    testPlant.isDead = true;

    await useWithRefill.executeUse(testCharacter, useWithRefillData, skillIncrease);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
      testCharacter,
      "Sorry, you can't water the plant because it is already dead."
    );
  });

  describe("executeRefill", () => {
    it("should sends an error message when the blueprint is not found", async () => {
      // @ts-ignore
      useWithRefillData.originItem = undefined;

      await useWithRefill.executeRefill(testCharacter, useWithRefillData, skillIncrease);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
        testCharacter,
        "Sorry, the blueprint could not be found."
      );
    });

    it("should sends an message when refilling is successful", async () => {
      // @ts-expect-error
      const sendRandomMessageToCharacterMock = jest.spyOn(useWithRefill, "sendRandomMessageToCharacter");

      await useWithRefill.executeRefill(testCharacter, useWithRefillData, skillIncrease);

      expect(sendRandomMessageToCharacterMock).toBeCalledWith(
        testCharacter,
        useWithRefillData.successMessages,
        true,
        null
      );
    });

    it("should sends an message already refilled", async () => {
      useWithRefillData.originItem.remainingUses = testRefillItemBlueprint.initialRemainingUses;

      await useWithRefill.executeRefill(testCharacter, useWithRefillData, skillIncrease);

      expect(mockSocketMessaging.sendMessageToCharacter).toBeCalledWith(
        testCharacter,
        "You have already refilled your watering can. 🌊"
      );
    });
  });
});
