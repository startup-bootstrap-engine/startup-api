import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IDepot } from "@entities/ModuleDepot/DepotModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { DepotFinder } from "@providers/depot/DepotFinder";
import { container, unitTestHelper } from "@providers/inversify/container";
import { OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CharacterGold } from "../CharacterGold";
import { CharacterItemContainer } from "../characterItems/CharacterItemContainer";

describe("CharacterGold.ts", () => {
  let testCharacter: ICharacter;
  let inventoryContainer: IItemContainer;
  let depot: IDepot;
  let characterGold: CharacterGold;
  let characterItemContainer: CharacterItemContainer;
  let depotFinder: DepotFinder;
  let testNPC: INPC;

  beforeAll(() => {
    characterGold = container.get(CharacterGold);
    characterItemContainer = container.get(CharacterItemContainer);
    depotFinder = container.get(DepotFinder);
  });

  beforeEach(async () => {
    testNPC = await unitTestHelper.createMockNPC();
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true, hasInventory: true });
    const inventory = await testCharacter.inventory;
    inventoryContainer = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

    depot = await unitTestHelper.createMockDepot(testNPC, testCharacter._id);

    expect(inventory).toBeDefined();
    expect(inventoryContainer).toBeDefined();
    expect(depot).toBeDefined();
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

  describe("Edge Cases", () => {
    it("should add gold to the depot if the inventory is full", async () => {
      // Simulate a full inventory
      // @ts-ignore
      jest.spyOn(CharacterGold.prototype, "tryAddingItemInventory").mockResolvedValueOnce(false);

      // @ts-ignore
      const tryAddItemToDepotSpy = jest.spyOn(CharacterGold.prototype, "tryAddingItemDepot").mockResolvedValue(true);

      const initialGoldAmount = 100;
      const result = await characterGold.addGoldToCharacterInventory(testCharacter, initialGoldAmount);

      expect(result).toBeTruthy();

      const addedGoldItem = await Item.findOne({ owner: testCharacter._id, key: OthersBlueprint.GoldCoin });
      expect(addedGoldItem).not.toBeNull();

      expect(tryAddItemToDepotSpy).toHaveBeenCalled();
    });

    it("should return false if adding gold to both inventory and depot fails", async () => {
      // Simulate failure to add to both inventory and depot
      jest.spyOn(CharacterItemContainer.prototype, "addItemToContainer").mockResolvedValue(false);
      // @ts-ignore
      jest.spyOn(DepotFinder.prototype, "findDepotWithSlots").mockResolvedValueOnce(null);

      const result = await characterGold.addGoldToCharacterInventory(testCharacter, 100);

      expect(result).toBeFalsy();
    });
  });
});
