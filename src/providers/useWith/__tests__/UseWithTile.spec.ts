/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { blueprintManager, container, unitTestHelper } from "@providers/inversify/container";
import { itemsBlueprintIndex } from "@providers/item/data/index";
import { ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { SkillIncrease } from "@providers/skill/SkillIncrease";

import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { ItemCraftableQueue } from "@providers/item/ItemCraftableQueue";
import { FromGridX, FromGridY, IRefillableItem, IUseWithTile, MapLayers } from "@rpg-engine/shared";
import { UseWithTileQueue } from "../abstractions/UseWithTileQueue";
describe("UseWithTile.ts", () => {
  let testItem: IItem,
    testRefillItem: IItem,
    testRefillItemBlueprint: IRefillableItem,
    testCharacter: ICharacter,
    testCharacterEquipment: IEquipment,
    useWithTile: UseWithTileQueue,
    useWithTileData: IUseWithTile,
    useWithTileDataRefill: IUseWithTile,
    skillIncrease: SkillIncrease,
    itemCraftable: ItemCraftableQueue,
    inMemoryHashTable: InMemoryHashTable,
    inventory: IItem,
    inventoryContainer: IItemContainer,
    sendErrorMessageToCharacter: jest.SpyInstance,
    characterSkills: ISkill;

  beforeAll(async () => {
    useWithTile = container.get<UseWithTileQueue>(UseWithTileQueue);
    skillIncrease = container.get<SkillIncrease>(SkillIncrease);
    itemCraftable = container.get<ItemCraftableQueue>(ItemCraftableQueue);
    inMemoryHashTable = container.get<InMemoryHashTable>(InMemoryHashTable);
    await unitTestHelper.initializeMapLoader();
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true, hasInventory: true });
    testCharacterEquipment = (await Equipment.findById(testCharacter.equipment)
      .populate("inventory")
      .exec()) as unknown as IEquipment;
    testItem = await unitTestHelper.createMockItemFromBlueprint(ToolsBlueprint.UseWithTileTest, {
      owner: testCharacter._id,
    });

    testRefillItem = await unitTestHelper.createMockItemFromBlueprint(ToolsBlueprint.WateringCan, {
      owner: testCharacter._id,
    });

    // Locate character close to the tile
    testCharacter.x = FromGridX(0);
    testCharacter.y = FromGridY(1);
    (await Character.findByIdAndUpdate(testCharacter._id, testCharacter).lean()) as ICharacter;

    useWithTileData = {
      originItemId: testItem.id,
      targetTile: {
        x: FromGridX(0),
        y: FromGridY(0),
        map: "example",
        layer: "ground" as unknown as MapLayers,
      },
    };

    useWithTileDataRefill = {
      originItemId: testRefillItem.id,
      targetTile: {
        x: FromGridX(0),
        y: FromGridY(0),
        map: "example",
        layer: "ground" as unknown as MapLayers,
      },
    };

    // equip character with item
    testCharacterEquipment.leftHand = testItem._id;
    await testCharacterEquipment.save();

    inventory = await testCharacter.inventory;

    inventoryContainer = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

    await unitTestHelper.addItemsToContainer(inventoryContainer, 1, [testRefillItem]);

    testRefillItemBlueprint = await blueprintManager.getBlueprint<IRefillableItem>("items", testRefillItem.baseKey);

    // @ts-ignore
    sendErrorMessageToCharacter = jest.spyOn(useWithTile.socketMessaging, "sendErrorMessageToCharacter");

    // @ts-ignore
    jest.spyOn(useWithTile.mapTiles, "getPropertyFromLayer" as any).mockImplementation(() => testItem.baseKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should pass all validations, run the useWithTileEffect and apply expected effect", async () => {
    // @ts-ignore
    const response = await useWithTile.validateData(testCharacter, useWithTileData);
    expect(response).toBeDefined();
    expect(response!.originItem.id).toEqual(testItem.id);

    await response?.useWithTileEffect!(
      response?.originItem,
      useWithTileData.targetTile,
      response?.targetName,
      testCharacter,
      itemCraftable,
      skillIncrease
    );

    expect(testCharacter.name).toEqual("Impacted by effect");
  });

  it("should fail validations | item without useWithTileEffect function defined", async () => {
    const originalItemBlueprint = { ...itemsBlueprintIndex[testItem.baseKey] };
    const testItemBlueprint = { ...originalItemBlueprint };
    delete testItemBlueprint.useWithTileEffect;

    try {
      // Replace the original blueprint with the modified one just for this test
      itemsBlueprintIndex[testItem.baseKey] = testItemBlueprint;

      // @ts-ignore
      await useWithTile.validateData(testCharacter, useWithTileData);
      throw new Error("This test should fail!");
    } catch (error: any) {
      expect(error.message).toEqual(
        `UseWithTile > originItem '${testItem.baseKey}' does not have a useWithTileEffect function defined`
      );
    } finally {
      // Restore the original item blueprint after the test
      itemsBlueprintIndex[testItem.baseKey] = originalItemBlueprint;
    }
  });
  it("should fail validations | character too far away from tile", async () => {
    testCharacter.x = FromGridX(5);
    testCharacter.y = FromGridY(5);
    (await Character.findByIdAndUpdate(testCharacter._id, testCharacter).lean()) as ICharacter;

    // @ts-ignore
    const sendErrorMsg = jest.spyOn(useWithTile.socketMessaging, "sendErrorMessageToCharacter" as any);

    // @ts-ignore
    const response = await useWithTile.validateData(testCharacter, useWithTileData);
    expect(response).toBeUndefined();
    expect(sendErrorMsg).toHaveBeenCalled();
  });

  it("validations should fail | character does not own item", async () => {
    try {
      testCharacterEquipment.leftHand = undefined;
      await testCharacterEquipment.save();

      // @ts-ignore
      testItem.owner = undefined;
      await testItem.save();

      // @ts-ignore
      await useWithTile.validateData(testCharacter, useWithTileData);
      throw new Error("This test should failed!");
    } catch (error: any) {
      expect(error.message).toEqual(`UseWith > Item with id ${testItem._id} does not belong to the character!`);
    }
  });

  it("should handles refillable items correctly", async () => {
    jest
      // @ts-ignore
      .spyOn(useWithTile.mapTiles, "getPropertyFromLayer" as any)
      .mockImplementation(() => testRefillItemBlueprint.refillResourceKey);

    // @ts-ignore
    const response = await useWithTile.validateData(testCharacter, useWithTileDataRefill);
    expect(response).toBeDefined();
    expect(response!.originItem.id).toEqual(testRefillItem.id);
  });

  it("should handles refillable items with missing refill resource property", async () => {
    jest
      // @ts-ignore
      .spyOn(useWithTile.mapTiles, "getPropertyFromLayer" as any)
      .mockImplementation(() => undefined);

    // @ts-ignore
    const response = await useWithTile.validateData(testCharacter, useWithTileDataRefill);
    expect(response).not.toBeDefined();
    expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, this tile cannot be used with the refill item provided"
    );
  });

  it("should handles refillable items with incorrect refill resource", async () => {
    const resource = "incorrect-refill-resource";
    jest
      // @ts-ignore
      .spyOn(useWithTile.mapTiles, "getPropertyFromLayer" as any)
      .mockImplementation(() => resource);

    // @ts-ignore
    const response = await useWithTile.validateData(testCharacter, useWithTileDataRefill);
    expect(response).not.toBeDefined();
    expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      `Invalid refill resource. Expected ${testRefillItemBlueprint.refillResourceKey}, got ${resource}`
    );
  });
});
