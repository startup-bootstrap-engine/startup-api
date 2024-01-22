import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { container, unitTestHelper } from "@providers/inversify/container";
import { IUseWithSeed } from "@rpg-engine/shared/dist/types/useWith.types";
import { UseWithSeed } from "../abstractions/UseWithSeed";

describe("UseWithSeed.ts", () => {
  let useWithSeed: UseWithSeed;
  let testCharacter: ICharacter;
  let useWithSeedData: IUseWithSeed;
  let carrotSeed: IItem;
  let inventory: IItem;
  let inventoryContainer: IItemContainer;
  let characterItemInventory: CharacterItemInventory;
  let sendErrorMessageToCharacter: jest.SpyInstance;

  beforeAll(() => {
    useWithSeed = container.get<UseWithSeed>(UseWithSeed);
    characterItemInventory = container.get<CharacterItemInventory>(CharacterItemInventory);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasSkills: true,
      hasInventory: true,
      hasEquipment: true,
    });

    carrotSeed = await unitTestHelper.createMockItemFromBlueprint("carrot-seed");

    inventory = await testCharacter.inventory;

    inventoryContainer = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

    await unitTestHelper.addItemsToContainer(inventoryContainer, 1, [carrotSeed]);

    useWithSeedData = {
      map: "example",
      isFertileGround: true,
      coordinates: {
        x: 0,
        y: 0,
      },
      itemKey: carrotSeed.key,
      isEntity: false,
    };

    // @ts-ignore
    sendErrorMessageToCharacter = jest.spyOn(useWithSeed.socketMessaging, "sendErrorMessageToCharacter");
  });

  it("should return the validation response when the data is valid", async () => {
    // @ts-ignore
    const response = await useWithSeed.validateData(testCharacter, useWithSeedData);

    expect(response).toBeDefined();
    expect(response?.itemKey).toBe(carrotSeed.key);
  });

  it("should send an error message if the character does not have the seed", async () => {
    await characterItemInventory.decrementItemFromInventoryByKey(carrotSeed.key, testCharacter, 1);

    // @ts-ignore
    const response = await useWithSeed.validateData(testCharacter, useWithSeedData);

    expect(response).not.toBeDefined();
    expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, You don't have any carrot-seed to use."
    );
  });

  it("should send an error message if the ground is not fertile", async () => {
    useWithSeedData.isFertileGround = false;

    // @ts-ignore
    const response = await useWithSeed.validateData(testCharacter, useWithSeedData);

    expect(response).not.toBeDefined();
    expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(testCharacter, "Sorry, You can't seeds here.");
  });
  it("should send an error message if the target is an entity", async () => {
    useWithSeedData.isEntity = true;

    // @ts-ignore
    const response = await useWithSeed.validateData(testCharacter, useWithSeedData);

    expect(response).not.toBeDefined();
    expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(testCharacter, "Sorry, You can't seeds here.");
  });

  it("should send an error message if key is invalid", async () => {
    const invalidKey = "invalidkey";
    useWithSeedData.itemKey = invalidKey;

    // @ts-ignore
    const response = await useWithSeed.validateData(testCharacter, useWithSeedData);

    expect(response).not.toBeDefined();
    expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      `Sorry, You don't have any ${invalidKey} to use.`
    );
  });
});
