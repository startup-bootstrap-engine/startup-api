import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import {
  ArmorsBlueprint,
  AxesBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemEquipValidator } from "../ItemEquipValidator";

describe("ItemEquipValidator", () => {
  let itemDoubleEquipValidator: ItemEquipValidator;
  let testCharacter: ICharacter;
  let testOneHandedItem: IItem;
  let testShield: IItem;
  let testTwoHandedItem: IItem;
  let testCharacterEquipment: IEquipment;
  let testNonWeapon: IItem;

  beforeAll(() => {
    itemDoubleEquipValidator = container.get(ItemEquipValidator);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true });
    testOneHandedItem = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.Sword);
    testShield = await unitTestHelper.createMockItemFromBlueprint(ShieldsBlueprint.PlateShield);
    testTwoHandedItem = await unitTestHelper.createMockItemFromBlueprint(AxesBlueprint.DoubleAxe);
    testNonWeapon = await unitTestHelper.createMockItemFromBlueprint(ArmorsBlueprint.IronArmor);

    testCharacterEquipment = (await Equipment.findById(testCharacter.equipment)) as IEquipment;
  });

  describe("canEquipItem method", () => {
    it("should allow equipping a one-handed weapon when no item is equipped", async () => {
      const result = await itemDoubleEquipValidator.canEquipItem(testCharacter._id, testOneHandedItem._id);
      expect(result).toBe(true);
    });

    it("should allow equipping a shield when no item is equipped", async () => {
      const result = await itemDoubleEquipValidator.canEquipItem(testCharacter._id, testShield._id);
      expect(result).toBe(true);
    });

    it("should allow equipping a two-handed weapon when no item is equipped", async () => {
      const result = await itemDoubleEquipValidator.canEquipItem(testCharacter._id, testTwoHandedItem._id);
      expect(result).toBe(true);
    });

    it("should not allow equipping a one-handed weapon when both hands are already equipped", async () => {
      testCharacterEquipment.leftHand = testOneHandedItem._id;
      testCharacterEquipment.rightHand = testOneHandedItem._id;
      await testCharacterEquipment.save();

      const result = await itemDoubleEquipValidator.canEquipItem(testCharacter._id, testOneHandedItem._id);
      expect(result).toBe(false);
    });

    it("should allow equipping a two-handed weapon when no item is equipped", async () => {
      const result = await itemDoubleEquipValidator.canEquipItem(testCharacter._id, testTwoHandedItem._id);
      expect(result).toBe(true);
    });

    it("should NOT allow equipping a two-handed weapon when a shield is equipped", async () => {
      testCharacterEquipment.leftHand = testShield._id;
      await testCharacterEquipment.save();

      const result = await itemDoubleEquipValidator.canEquipItem(testCharacter._id, testTwoHandedItem._id);
      expect(result).toBe(false);
    });

    it("should allow equipping non-weapon items", async () => {
      const result = await itemDoubleEquipValidator.canEquipItem(testCharacter._id, testNonWeapon._id);
      expect(result).toBe(true);
    });

    it("should NOT allow equipping a one-handed weapon when both hands are occupied", async () => {
      testCharacterEquipment.leftHand = testOneHandedItem._id;
      testCharacterEquipment.rightHand = testShield._id;
      await testCharacterEquipment.save();

      const result = await itemDoubleEquipValidator.canEquipItem(testCharacter._id, testOneHandedItem._id);
      expect(result).toBe(false);
    });
  });
});
