import { container, unitTestHelper } from "@providers/inversify/container";

import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import {
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { CombatSkill, EntityAttackType } from "@rpg-engine/shared";
import { CharacterWeapon } from "../CharacterWeapon";

describe("CharacterWeapon.spec.ts", () => {
  let characterWeapon: CharacterWeapon;
  let testCharacter: ICharacter;

  beforeAll(() => {
    characterWeapon = container.get<CharacterWeapon>(CharacterWeapon);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true });

    const testSword = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.ShortSword);
    const testShield = await unitTestHelper.createMockItemFromBlueprint(ShieldsBlueprint.WoodenShield);

    const equipment = (await Equipment.findById(testCharacter.equipment)) as IEquipment;

    if (!equipment) {
      throw new Error("Equipment not found");
    }

    equipment.leftHand = testSword._id;
    equipment.rightHand = testShield._id;

    await equipment.save();
  });

  it("should return the correct weapon", async () => {
    const weapon = await characterWeapon.getWeapon(testCharacter);

    if (!weapon || !weapon.item) throw new Error("Weapon not found");

    expect(weapon.item.key).toBe(SwordsBlueprint.ShortSword);
  });

  it("should return hasShield as true, if it has a shield", async () => {
    const hasShield = await characterWeapon.hasShield(testCharacter);

    expect(hasShield).toBeTruthy();
  });

  it("should return the proper attack type - MELEE", async () => {
    const attackType = await characterWeapon.getAttackType(testCharacter);

    expect(attackType).toBe(EntityAttackType.Melee);
  });
  it("should return the proper attack type - RANGED", async () => {
    const testBow = await unitTestHelper.createMockItemFromBlueprint(RangedWeaponsBlueprint.Bow);

    const equipment = (await Equipment.findById(testCharacter.equipment)) as IEquipment;

    if (!equipment) {
      throw new Error("Equipment not found");
    }

    equipment.leftHand = testBow._id;
    equipment.rightHand = undefined;

    await equipment.save();

    const attackType = await characterWeapon.getAttackType(testCharacter);

    expect(attackType).toBe(EntityAttackType.Ranged);
  });

  describe("getWeapon method", () => {
    it("should return the correct weapon from right hand", async () => {
      const testSword = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.ShortSword);
      const equipment = (await Equipment.findById(testCharacter.equipment)) as IEquipment;

      equipment.leftHand = undefined;
      equipment.rightHand = testSword._id;
      await equipment.save();

      const weapon = await characterWeapon.getWeapon(testCharacter);
      expect(weapon?.item.key).toBe(SwordsBlueprint.ShortSword);
    });
  });

  describe("getAttackType method", () => {
    it("should return RANGED if the weapon is a bow", async () => {
      const testBow = await unitTestHelper.createMockItemFromBlueprint(RangedWeaponsBlueprint.Bow);
      const equipment = (await Equipment.findById(testCharacter.equipment)) as IEquipment;

      equipment.leftHand = testBow._id;
      equipment.rightHand = undefined;
      await equipment.save();

      const attackType = await characterWeapon.getAttackType(testCharacter);
      expect(attackType).toBe(EntityAttackType.Ranged);
    });

    it("should return MELEE if the weapon is a sword", async () => {
      const testSword = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.ShortSword);
      const equipment = (await Equipment.findById(testCharacter.equipment)) as IEquipment;

      equipment.leftHand = testSword._id;
      equipment.rightHand = undefined;
      await equipment.save();

      const attackType = await characterWeapon.getAttackType(testCharacter);
      expect(attackType).toBe(EntityAttackType.Melee);
    });

    it("should default to MELEE if no weapon is equipped", async () => {
      const equipment = (await Equipment.findById(testCharacter.equipment)) as IEquipment;

      equipment.leftHand = undefined;
      equipment.rightHand = undefined;
      await equipment.save();

      const attackType = await characterWeapon.getAttackType(testCharacter);
      expect(attackType).toBe(EntityAttackType.Melee);
    });
  });

  describe("getSkillNameByWeapon method", () => {
    it("should return the correct skill name for a given weapon subtype", async () => {
      const testBow = await unitTestHelper.createMockItemFromBlueprint(RangedWeaponsBlueprint.Bow);
      const equipment = (await Equipment.findById(testCharacter.equipment)) as IEquipment;

      equipment.leftHand = testBow._id;
      equipment.rightHand = undefined;
      await equipment?.save();

      const skillName = await characterWeapon.getSkillNameByWeapon(testCharacter);
      expect(skillName).toBe(CombatSkill.Distance);
    });

    it("should return undefined if no weapon is equipped", async () => {
      const equipment = (await Equipment.findById(testCharacter.equipment)) as IEquipment;

      equipment.leftHand = undefined;
      equipment.rightHand = undefined;
      await equipment.save();

      const skillName = await characterWeapon.getSkillNameByWeapon(testCharacter);
      expect(skillName).toBeUndefined();
    });
  });

  describe("Integration and edge cases", () => {
    it("should handle the case where an item is deleted from the database after being equipped", async () => {
      const testSword = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.LongSword);
      const equipment = (await Equipment.findById(testCharacter.equipment)) as IEquipment;

      equipment.leftHand = testSword._id;
      await equipment.save();

      await testSword.remove(); // Simulate item being deleted

      const weapon = await characterWeapon.getWeapon(testCharacter);
      expect(weapon).toBeUndefined(); // Should handle gracefully, possibly logging an error
    });
  });
});
