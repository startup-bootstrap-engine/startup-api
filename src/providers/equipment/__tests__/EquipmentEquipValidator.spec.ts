import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import {
  AxesBlueprint,
  DaggersBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { CharacterClass, IEquipmentSet, ItemSlotType } from "@rpg-engine/shared";
import { EquipmentEquipValidator } from "../EquipmentEquipValidator";

describe("EquipmentEquipValidator Tests", () => {
  let equipmentEquipValidator: EquipmentEquipValidator;
  let character: ICharacter;
  let oneHandedItem: IItem;
  let twoHandedItem: IItem;
  let shieldItem: IItem;

  beforeAll(() => {
    equipmentEquipValidator = container.get<EquipmentEquipValidator>(EquipmentEquipValidator);
  });

  beforeEach(async () => {
    character = await unitTestHelper.createMockCharacter({ class: CharacterClass.Warrior }, { hasEquipment: true });
    oneHandedItem = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.ShortSword);
    twoHandedItem = await unitTestHelper.createMockItemFromBlueprint(AxesBlueprint.DoubleAxe);
    shieldItem = await unitTestHelper.createMockItemFromBlueprint(ShieldsBlueprint.BanditShield);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Critical Paths", () => {
    it("should properly equip a two handed weapon", async () => {
      const equipSlots = { leftHand: null, rightHand: null } as unknown as IEquipmentSet;
      const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, twoHandedItem, character);
      expect(result).toBe(true);
    });

    it("should properly equip a one handed weapon when no item is equipped", async () => {
      const equipSlots = { leftHand: null, rightHand: null } as unknown as IEquipmentSet;
      const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, oneHandedItem, character);
      expect(result).toBe(true);
    });

    it("should properly equip a shield when no item is equipped", async () => {
      const equipSlots = { leftHand: null, rightHand: null } as unknown as IEquipmentSet;
      const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, shieldItem, character);
      expect(result).toBe(true);
    });

    it("should properly equip a two handed weapon when no item is equipped", async () => {
      const equipSlots = { leftHand: null, rightHand: null } as unknown as IEquipmentSet;
      const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, twoHandedItem, character);
      expect(result).toBe(true);
    });
  });

  describe("Validations", () => {
    describe("General validations", () => {
      it("should not allow equipping if item is not equippable on hands", async () => {
        const equipSlots = {
          leftHand: null,
          rightHand: null,
        } as unknown as IEquipmentSet;

        const weirdItem = await unitTestHelper.createMockItemFromBlueprint(DaggersBlueprint.Dagger, {
          allowedEquipSlotType: [ItemSlotType.Head],
        });

        const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, weirdItem, character);

        expect(result).toBe(false);
      });

      it("Not allowing equipping a one-handed weapon when both hands are already equipped", async () => {
        const equipSlots = {
          leftHand: oneHandedItem._id,
          rightHand: shieldItem._id,
        } as unknown as IEquipmentSet;

        const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, oneHandedItem, character);

        expect(result).toBe(false);
      });
    });

    describe("Shield validation", () => {
      it("should ALLOW equipping another one-handed if one is already equipped and it's a shield", async () => {
        const equipSlots = {
          leftHand: shieldItem._id,
          rightHand: null,
        } as unknown as IEquipmentSet;

        const anotherOneHanded = await unitTestHelper.createMockItemFromBlueprint(DaggersBlueprint.Dagger);

        const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, anotherOneHanded, character);

        expect(result).toBe(true);
      });

      it("should NOT allow 2 shields from being equipped", async () => {
        const equipSlots = {
          leftHand: shieldItem._id,
          rightHand: null,
        } as unknown as IEquipmentSet;

        const anotherShield = await unitTestHelper.createMockItemFromBlueprint(ShieldsBlueprint.BanditShield);

        const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, anotherShield, character);

        expect(result).toBe(false);
      });

      it("should allow equipping a shield if a one-handed item is already equipped", async () => {
        const equipSlots = {
          leftHand: oneHandedItem._id,
          rightHand: null,
        } as unknown as IEquipmentSet;

        const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, shieldItem, character);

        expect(result).toBe(true);
      });

      it("should not allow equipping a two-handed weapon when a shield is equipped", async () => {
        const equipSlots = {
          leftHand: shieldItem._id,
          rightHand: null,
        } as unknown as IEquipmentSet;

        const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, twoHandedItem, character);

        expect(result).toBe(false);
      });
    });

    it("should not equip another one-handed if one is already equipped", async () => {
      const equipSlots = {
        leftHand: oneHandedItem._id,
        rightHand: null,
      } as unknown as IEquipmentSet;

      const anotherOneHanded = await unitTestHelper.createMockItemFromBlueprint(DaggersBlueprint.Dagger);

      const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, anotherOneHanded, character);

      expect(result).toBe(false);
    });
  });

  describe("Two handed", () => {
    it("should not allow equipping another two-handed if one is already equipped", async () => {
      const equipSlots = {
        leftHand: twoHandedItem._id,
        rightHand: null,
      } as unknown as IEquipmentSet;

      const anotherTwoHanded = await unitTestHelper.createMockItemFromBlueprint(AxesBlueprint.DoubleAxe);

      const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, anotherTwoHanded, character);

      expect(result).toBe(false);
    });

    it("Should now allow equipping a two-handed weapon when a shield is equipped", async () => {
      const equipSlots = {
        leftHand: shieldItem._id,
        rightHand: null,
      } as unknown as IEquipmentSet;

      const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, twoHandedItem, character);

      expect(result).toBe(false);
    });

    it("should not allow equipping a 2-handed item if a one-handed is already in place", async () => {
      const equipSlots = {
        leftHand: oneHandedItem._id,
        rightHand: null,
      } as unknown as IEquipmentSet;

      const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, twoHandedItem, character);

      expect(result).toBe(false);
    });

    it("should not allow equipping a 2-handed item if a one-handed is already in place", async () => {
      const equipSlots = {
        leftHand: oneHandedItem._id,
        rightHand: null,
      } as unknown as IEquipmentSet;

      const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, twoHandedItem, character);

      expect(result).toBe(false);
    });
  });

  describe("Dual yielding", () => {
    it("A rogue can dual yield 2 daggers", async () => {
      const rogue = await unitTestHelper.createMockCharacter({ class: CharacterClass.Rogue }, { hasEquipment: true });

      const firstDagger = await unitTestHelper.createMockItemFromBlueprint(DaggersBlueprint.Dagger);

      const equipSlots = {
        leftHand: firstDagger._id,
        rightHand: null,
      } as unknown as IEquipmentSet;

      const secondDagger = await unitTestHelper.createMockItemFromBlueprint(DaggersBlueprint.Dagger);

      const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, secondDagger, rogue);
      expect(result).toBe(true);
    });

    it("A rogue can't yield 2 axes", async () => {
      const rogue = await unitTestHelper.createMockCharacter({ class: CharacterClass.Rogue }, { hasEquipment: true });

      const firstAxe = await unitTestHelper.createMockItemFromBlueprint(AxesBlueprint.Axe);

      const equipSlots = {
        leftHand: firstAxe._id,
        rightHand: null,
      } as unknown as IEquipmentSet;

      const secondAxe = await unitTestHelper.createMockItemFromBlueprint(AxesBlueprint.DoubleAxe);

      const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, secondAxe, rogue);
      expect(result).toBe(false);
    });

    it("Allows a berserker to wear 2 different one-handed weapons (sword and axe)", async () => {
      const berserker = await unitTestHelper.createMockCharacter(
        { class: CharacterClass.Berserker },
        { hasEquipment: true }
      );

      const firstAxe = await unitTestHelper.createMockItemFromBlueprint(AxesBlueprint.Axe);

      const equipSlots = {
        leftHand: firstAxe._id,
        rightHand: null,
      } as unknown as IEquipmentSet;

      const secondSword = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.ShortSword);

      const result = await equipmentEquipValidator.validateHandsItemEquip(equipSlots, secondSword, berserker);
      expect(result).toBe(true);
    });
  });
});
