import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CharacterGold } from "../CharacterGold";
import { CharacterItemContainer } from "../characterItems/CharacterItemContainer";

describe("CharacterGold.ts", () => {
  let testCharacter: ICharacter;
  let inventoryContainer: IItemContainer;
  let characterGold: CharacterGold;
  let characterItemContainer: CharacterItemContainer;

  beforeAll(() => {
    characterGold = container.get(CharacterGold);
    characterItemContainer = container.get(CharacterItemContainer);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true, hasInventory: true });
    const inventory = await testCharacter.inventory;
    inventoryContainer = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

    expect(inventory).toBeDefined();
    expect(inventoryContainer).toBeDefined();
  });

  describe("addGoldToCharacterInventory", () => {
    it("should successfully add gold to the character's inventory", async () => {
      const initialGoldAmount = 100;
      const result = await characterGold.addGoldToCharacterInventory(testCharacter, initialGoldAmount);

      expect(result).toBeTruthy();

      const addedGoldItem = await Item.findOne({ owner: testCharacter._id, key: OthersBlueprint.GoldCoin });
      expect(addedGoldItem).not.toBeNull();

      const updatedContainer = (await ItemContainer.findById(inventoryContainer._id)) as unknown as IItemContainer;
      const itemExistsInSlot = Object.values(updatedContainer.slots).some(
        (slot: IItem) => slot?._id!.toString() === addedGoldItem!._id.toString()
      );

      expect(itemExistsInSlot).toBeTruthy();
    });

    it("should stack gold if there are existing stackable gold items", async () => {
      const stackableGold = await unitTestHelper.createMockItem({
        key: OthersBlueprint.GoldCoin,
        maxStackSize: 100,
        stackQty: 50,
      });
      await characterItemContainer.addItemToContainer(stackableGold, testCharacter, inventoryContainer._id);

      const additionalGoldAmount = 25;
      const result = await characterGold.addGoldToCharacterInventory(testCharacter, additionalGoldAmount);

      expect(result).toBeTruthy();

      const updatedGoldItem = await Item.findById(stackableGold._id);

      expect(updatedGoldItem?.stackQty).toBe(75);
    });

    it("should create a new gold item if existing stacks are full", async () => {
      const fullStackGold = await unitTestHelper.createMockItem({
        key: OthersBlueprint.GoldCoin,
        maxStackSize: 100,
        stackQty: 100,
      });
      await characterItemContainer.addItemToContainer(fullStackGold, testCharacter, inventoryContainer._id);

      const newGoldAmount = 50;
      const result = await characterGold.addGoldToCharacterInventory(testCharacter, newGoldAmount);

      expect(result).toBeTruthy();

      const newGoldItem = await Item.findOne({ owner: testCharacter._id, stackQty: 50 });

      expect(newGoldItem).not.toBeNull();

      const updatedContainer = (await ItemContainer.findById(inventoryContainer._id)) as unknown as IItemContainer;
      const itemExistsInSlot = Object.values(updatedContainer.slots).some(
        (slot: IItem) => slot?._id!.toString() === newGoldItem!._id.toString()
      );

      expect(itemExistsInSlot).toBeTruthy();
    });

    it("should not add gold if the character does not have an inventory container", async () => {
      const characterWithoutInventory = await unitTestHelper.createMockCharacter(null, { hasInventory: false });

      const result = await characterGold.addGoldToCharacterInventory(characterWithoutInventory, 100);

      expect(result).toBeFalsy();

      const addedGoldItem = await Item.findOne({ owner: characterWithoutInventory._id, key: OthersBlueprint.GoldCoin });
      expect(addedGoldItem).toBeNull();
    });

    it("should handle adding zero gold", async () => {
      const result = await characterGold.addGoldToCharacterInventory(testCharacter, 0);

      expect(result).toBeFalsy();

      const addedGoldItem = await Item.findOne({ owner: testCharacter._id, key: OthersBlueprint.GoldCoin });
      expect(addedGoldItem).toBeNull(); // No gold item should be added for zero amount.
    });
  });
});
