import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { CharacterWeapon } from "@providers/character/CharacterWeapon";
import { container, unitTestHelper } from "@providers/inversify/container";
import { itemsBlueprintIndex } from "@providers/item/data/index";
import { RangedWeaponsBlueprint, SwordsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IEquipmentSet, ItemSocketEvents, UISocketEvents } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { EquipmentSlots } from "../EquipmentSlots";
import { EquipmentUnequip } from "../EquipmentUnequip";

describe("EquipmentUnequip.spec.ts", () => {
  let equipmentUnequip: EquipmentUnequip;
  let equipment: IEquipment;
  let testItem: IItem;
  let testStackableItem: IItem;
  let testCharacter: ICharacter;
  let inventory: IItem;
  let inventoryContainer: IItemContainer;
  let equipmentSlots: EquipmentSlots;
  let socketMessaging;
  let characterWeapon: CharacterWeapon;

  beforeAll(() => {
    equipmentUnequip = container.get<EquipmentUnequip>(EquipmentUnequip);
    equipmentSlots = container.get<EquipmentSlots>(EquipmentSlots);
    characterWeapon = container.get<CharacterWeapon>(CharacterWeapon);
  });

  beforeEach(async () => {
    testItem = (await unitTestHelper.createMockItem()) as unknown as IItem;
    testStackableItem = (await unitTestHelper.createStackableMockItem({
      stackQty: 25,
      maxStackSize: 50,
    })) as unknown as IItem;
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
    });
    equipment = (await Equipment.findById(testCharacter.equipment)) as unknown as IEquipment;

    equipment.leftHand = testItem._id;
    equipment.accessory = testStackableItem._id;
    await equipment.save();

    inventory = await testCharacter.inventory;
    inventoryContainer = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

    // @ts-ignore
    socketMessaging = jest.spyOn(equipmentUnequip.socketMessaging, "sendEventToUser");

    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("Should successfully unequip an item", async () => {
    const unequip = await equipmentUnequip.unequip(testCharacter, inventory, testItem);
    expect(unequip).toBeTruthy();

    const slots = await equipmentSlots.getEquipmentSlots(
      testCharacter._id,
      testCharacter.equipment as unknown as string
    );

    expect(slots.leftHand).toBeFalsy();
  });

  it("Should successfully trigger an inventory and equipment update event when unequip is successful", async () => {
    const unequip = await equipmentUnequip.unequip(testCharacter, inventory, testItem);
    expect(unequip).toBeTruthy();

    const slots = (await equipmentSlots.getEquipmentSlots(
      testCharacter._id,
      testCharacter.equipment as unknown as string
    )) as unknown as IEquipmentSet;

    const inventoryContainer = (await ItemContainer.findById(
      inventory.itemContainer
    ).lean()) as unknown as IItemContainer;

    const accessorySlot = slots.accessory as unknown as IItem;

    expect(socketMessaging).toHaveBeenCalledWith(
      testCharacter.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      expect.objectContaining({
        equipment: expect.objectContaining({
          _id: slots._id,
          accessory: expect.objectContaining({
            key: accessorySlot.key!,
            name: accessorySlot.name!,
          }),
        }),
        inventory: expect.objectContaining({
          _id: inventoryContainer._id,
          name: inventoryContainer.name,
        }),
      })
    );
  });

  it("Should update the character attack type from Ranged to Melee when unequipping a bow", async () => {
    const bowBlueprint = itemsBlueprintIndex[RangedWeaponsBlueprint.Bow];
    const rangedItem = await unitTestHelper.createMockItem({ ...bowBlueprint });

    equipment.leftHand = rangedItem._id;
    await equipment.save();

    const attackTypeBefore = await characterWeapon.getAttackType(testCharacter);
    expect(attackTypeBefore).toBe(EntityAttackType.Ranged);

    const unequip = await equipmentUnequip.unequip(testCharacter, inventory, rangedItem);
    expect(unequip).toBeTruthy();

    const attackTypeAfter = await characterWeapon.getAttackType(testCharacter);
    expect(attackTypeAfter).toBe(EntityAttackType.Melee);
  });

  it("Should keep the character attack type as Melee when unequipping a melee weapon", async () => {
    const swordBlueprint = itemsBlueprintIndex[SwordsBlueprint.ShortSword];
    const meleeItem = await unitTestHelper.createMockItem({ ...swordBlueprint });

    equipment.leftHand = meleeItem._id;
    await equipment.save();

    const attackTypeBefore = await characterWeapon.getAttackType(testCharacter);
    expect(attackTypeBefore).toBe(EntityAttackType.Melee);

    const unequip = await equipmentUnequip.unequip(testCharacter, inventory, meleeItem);
    expect(unequip).toBeTruthy();

    const attackTypeAfter = await characterWeapon.getAttackType(testCharacter);
    expect(attackTypeAfter).toBe(EntityAttackType.Melee);
  });

  describe("Validation cases", () => {
    it("should not unequip an equipment that the character does not have on equipment", async () => {
      equipment.leftHand = undefined;
      await equipment.save();

      const unequip = await equipmentUnequip.unequip(testCharacter, inventory, testItem);

      expect(unequip).toBeFalsy();

      expect(socketMessaging).toHaveBeenCalledWith(testCharacter.channelId!, UISocketEvents.ShowMessage, {
        message: "Sorry, you cannot unequip an item that you don't have.",
        type: "error",
      });
    });

    it("should fail if the inventory container is full", async () => {
      const anotherItem = (await unitTestHelper.createMockItem()) as unknown as IItem;

      inventoryContainer = await unitTestHelper.addItemsToContainer(inventoryContainer, 1, [anotherItem]);

      const unequip = await equipmentUnequip.unequip(testCharacter, inventory, testItem);

      expect(unequip).toBeFalsy();

      expect(socketMessaging).toHaveBeenCalledWith(testCharacter.channelId!, UISocketEvents.ShowMessage, {
        message: "Sorry, your inventory is full.",
        type: "error",
      });

      expect(equipment.leftHand).toBe(testItem._id);
    });

    it("should fail if the item to unequip is not found", async () => {
      const nonExistentItem = { _id: "nonexistent_id" } as IItem;

      const unequip = await equipmentUnequip.unequip(testCharacter, inventory, nonExistentItem);

      expect(unequip).toBeFalsy();

      expect(socketMessaging).toHaveBeenCalledWith(testCharacter.channelId!, UISocketEvents.ShowMessage, {
        message: "Sorry, you cannot unequip an item that you don't have.",
        type: "error",
      });
    });
  });

  describe("Edge cases", () => {
    it("Should properly combine stackable items on unequip", async () => {
      const anotherStackableItem = (await unitTestHelper.createStackableMockItem({
        stackQty: 25,
        maxStackSize: 50,
      })) as unknown as IItem;

      inventoryContainer = await unitTestHelper.addItemsToContainer(inventoryContainer, 1, [anotherStackableItem]);

      const unequip = await equipmentUnequip.unequip(testCharacter, inventory, testStackableItem);
      expect(unequip).toBeTruthy();

      const slots = await equipmentSlots.getEquipmentSlots(
        testCharacter._id,
        testCharacter.equipment as unknown as string
      );

      expect(slots.accessory).toBeNull();

      const inventoryContainerUpdated = (await ItemContainer.findById(
        inventory.itemContainer
      )) as unknown as IItemContainer;

      expect(inventoryContainerUpdated.slots[0]._id).toEqual(anotherStackableItem._id);
      expect(inventoryContainerUpdated.slots[0].stackQty).toBe(50);
    });

    it("Should handle unequipping the last item correctly", async () => {
      // Remove all items except one
      equipment.leftHand = testItem._id;
      equipment.rightHand = undefined;
      equipment.accessory = undefined;
      await equipment.save();

      const unequip = await equipmentUnequip.unequip(testCharacter, inventory, testItem);
      expect(unequip).toBeTruthy();

      const slots = await equipmentSlots.getEquipmentSlots(
        testCharacter._id,
        testCharacter.equipment as unknown as string
      );

      expect(slots.leftHand).toBeFalsy();
      expect(slots.rightHand).toBeFalsy();
      expect(slots.accessory).toBeFalsy();
    });

    describe("Additional EquipmentUnequip Tests", () => {
      beforeEach(() => {
        // Clear all mocks before each test to prevent test contamination
        jest.clearAllMocks();
      });

      it("should fail to unequip when the character is not valid (e.g., null or undefined)", async () => {
        const invalidCharacter = null as unknown as ICharacter; // Setting character to null
        const unequip = await equipmentUnequip.unequip(invalidCharacter, inventory, testItem);
        expect(unequip).toBeFalsy();

        expect(socketMessaging).not.toHaveBeenCalled();
      });

      it("should fail to unequip when equipment data is missing", async () => {
        testCharacter.equipment = undefined as unknown as string; // Simulate missing equipment data
        const unequip = await equipmentUnequip.unequip(testCharacter, inventory, testItem);
        expect(unequip).toBeFalsy();

        expect(socketMessaging).toHaveBeenCalledWith(
          testCharacter.channelId!,
          UISocketEvents.ShowMessage,
          expect.objectContaining({
            message: "Sorry, not possible.",
            type: "error",
          })
        );
      });

      it("should fail to unequip if the inventory container ID is not defined", async () => {
        inventory.itemContainer = undefined as unknown as string; // Set the itemContainer to undefined

        const unequip = await equipmentUnequip.unequip(testCharacter, inventory, testItem);
        expect(unequip).toBeFalsy();
      });
      it("should handle errors gracefully when performUnequipTransaction fails", async () => {
        // @ts-ignore
        // eslint-disable-next-line require-await
        jest.spyOn(equipmentUnequip, "performUnequipTransaction").mockImplementationOnce(async () => false);

        const unequip = await equipmentUnequip.unequip(testCharacter, inventory, testItem);
        expect(unequip).toBeFalsy(); // Expect the unequip process to fail

        const slots = await equipmentSlots.getEquipmentSlots(
          testCharacter._id,
          testCharacter.equipment as unknown as string
        );
        expect(slots.leftHand).toMatchObject({
          _id: testItem._id.toString(),
          key: testItem.key,
          name: testItem.name,
        }); // The item should still be in the left hand slot
      });
      it("should correctly handle the situation where buffs are not found for the item", async () => {
        // @ts-ignore
        jest.spyOn(equipmentUnequip.characterBuffTracker, "getBuffsByItemId").mockResolvedValueOnce([]);

        const unequip = await equipmentUnequip.unequip(testCharacter, inventory, testItem);
        expect(unequip).toBeTruthy();

        expect(socketMessaging).toHaveBeenCalledWith(
          testCharacter.channelId!,
          ItemSocketEvents.EquipmentAndInventoryUpdate,
          expect.anything()
        );
      });

      it("should handle unequipping multiple items in quick succession", async () => {
        const secondItem = (await unitTestHelper.createMockItem()) as unknown as IItem;

        equipment.rightHand = secondItem._id;
        await equipment.save();

        const unequipFirst = await equipmentUnequip.unequip(testCharacter, inventory, testItem);
        expect(unequipFirst).toBeTruthy();

        const unequipSecond = await equipmentUnequip.unequip(testCharacter, inventory, secondItem);
        expect(unequipSecond).toBeTruthy();

        const slots = await equipmentSlots.getEquipmentSlots(
          testCharacter._id,
          testCharacter.equipment as unknown as string
        );

        expect(slots.leftHand).toBeFalsy();
        expect(slots.rightHand).toBeFalsy();
      });

      it("should correctly remove item ownership when unequipping", async () => {
        const unequip = await equipmentUnequip.unequip(testCharacter, inventory, testItem);
        expect(unequip).toBeTruthy();

        const updatedItem = await Item.findById(testItem._id).lean();
        expect(updatedItem?.owner?.toString()).toEqual(testCharacter._id.toString());
      });
    });
  });
});
