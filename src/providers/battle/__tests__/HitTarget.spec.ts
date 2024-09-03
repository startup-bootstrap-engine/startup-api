/* eslint-disable no-unused-vars */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { HitTargetQueue } from "@providers/battle/HitTargetQueue";
import { BONUS_DAMAGE_MULTIPLIER } from "@providers/constants/BattleConstants";
import { container, unitTestHelper } from "@providers/inversify/container";
import { itemsBlueprintIndex } from "@providers/item/data";
import {
  RangedWeaponsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { SpellCast } from "@providers/spells/SpellCast";
import { spellSelfHealing } from "@providers/spells/data/blueprints/all/SpellSelfHealing";
import { BattleEventType, CharacterClass, FromGridX } from "@rpg-engine/shared";

describe("HitTarget", () => {
  let hitTarget: HitTargetQueue;
  let targetCharacter: ICharacter;
  let attackerCharacter: ICharacter;
  let testNPC: INPC;
  let bowItem: IItem;
  let fireSwordItem: IItem;
  let applyEntitySpy: jest.SpyInstance;
  let getWeaponSpy: jest.SpyInstance;
  let findByIdSpy: jest.SpyInstance;
  let spellCast: SpellCast;
  let characterSkills: ISkill;

  beforeAll(() => {
    hitTarget = container.get(HitTargetQueue);
    spellCast = container.get<SpellCast>(SpellCast);
  });

  beforeEach(async () => {
    testNPC = await unitTestHelper.createMockNPC(
      {
        key: "rat",
      },
      { hasSkills: true }
    );
    targetCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasSkills: true,
    });
    attackerCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasSkills: true,
      hasInventory: true,
    });

    const bow = itemsBlueprintIndex[RangedWeaponsBlueprint.Bow];
    const fireSword = itemsBlueprintIndex[SwordsBlueprint.FireSword];

    await testNPC.populate("skills").execPopulate();
    await targetCharacter.populate("skills").execPopulate();
    await attackerCharacter.populate("skills").execPopulate();

    bowItem = new Item({ ...bow });

    fireSwordItem = new Item({ ...fireSword });

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Core hit logic", () => {
    let testCharacter: ICharacter;

    beforeEach(async () => {
      testCharacter = await unitTestHelper.createMockCharacter(
        {
          health: 80,
          learnedSpells: [spellSelfHealing.key as any],
        },
        {
          hasEquipment: true,
          hasSkills: true,
        }
      );

      await Character.findByIdAndUpdate(testCharacter.id, { class: CharacterClass.Warrior });
      const skills = (await Skill.findById(testCharacter.skills).lean()) as ISkill;
      characterSkills = skills;
      characterSkills.level = spellSelfHealing.minLevelRequired!;
      characterSkills.magic.level = spellSelfHealing.minMagicLevelRequired;
      (await Skill.findByIdAndUpdate(characterSkills._id, characterSkills).lean()) as ISkill;

      testCharacter.x = FromGridX(0);
      testCharacter.y = FromGridX(0);
      (await Character.findByIdAndUpdate(testCharacter._id, testCharacter).lean()) as ICharacter;

      testNPC.x = FromGridX(1);
      testNPC.y = FromGridX(1);
      (await NPC.findByIdAndUpdate(testNPC._id, testNPC).lean()) as INPC;
    });

    it("when battle event is a hit, it should decrease the target's health", async () => {
      jest
        // @ts-ignore
        .spyOn(hitTarget.battleEvent, "calculateEvent" as any)
        .mockImplementation(() => BattleEventType.Hit);
      // @ts-ignore
      jest.spyOn(hitTarget.battleDamageCalculator, "calculateHitDamage" as any).mockImplementation(() => 50);

      const increaseSkillsOnBattle = jest.spyOn(
        // @ts-ignore
        hitTarget.skillIncrease,
        "increaseSkillsOnBattle" as any
      );

      // @ts-ignore
      await hitTarget.hit(testCharacter, testNPC);

      expect(testNPC.health).toBeLessThan(testNPC.maxHealth);
      expect(increaseSkillsOnBattle).toHaveBeenCalled();
    });

    it("when healing spell cast before a hit,  it should properly adjusted the health", async () => {
      const attackDamage = 20;
      const characterHealth = testCharacter.health;

      // Mock hit functionality
      jest
        // @ts-ignore
        .spyOn(hitTarget.battleEvent, "calculateEvent" as any)
        .mockImplementation(() => BattleEventType.Hit);
      // @ts-ignore
      jest.spyOn(hitTarget.battleDamageCalculator, "calculateHitDamage" as any).mockImplementation(() => attackDamage);

      await spellCast.castSpell({ magicWords: "talas faenya" }, testCharacter);

      await hitTarget.hit(testNPC, testCharacter);

      const updatedTestCharacter = (await Character.findById(testCharacter._id)) as ICharacter;

      expect(updatedTestCharacter.health).toBeLessThan(characterHealth);
      expect(updatedTestCharacter.health).toBeGreaterThan(characterHealth - attackDamage);
    });

    it("when a hit occurred before a healing spell cast, it should properly adjust the health", async () => {
      const attackDamage = 20;
      const characterHealth = testCharacter.health;

      // Mock hit functionality
      // @ts-ignore
      jest.spyOn(hitTarget.battleEvent, "calculateEvent" as any).mockImplementation(() => BattleEventType.Hit);
      // @ts-ignore
      jest.spyOn(hitTarget.battleDamageCalculator, "calculateHitDamage" as any).mockImplementation(() => attackDamage);

      // Ensure hit is fully resolved before moving on
      await hitTarget.hit(testNPC, testCharacter);

      // Ensure healing spell is fully cast before moving on
      await spellCast.castSpell({ magicWords: "talas faenya" }, testCharacter);

      // Fetch the updated character after all operations
      const updatedTestCharacter = (await Character.findById(testCharacter._id)) as ICharacter;

      // Ensure health was decreased but not below the damage level
      expect(updatedTestCharacter.health).toBeLessThan(characterHealth);
      expect(updatedTestCharacter.health).toBeGreaterThan(characterHealth - attackDamage);
    });

    it("when battle event is a miss, it should not decrease the target's health", async () => {
      jest
        // @ts-ignore
        .spyOn(hitTarget.battleEvent, "calculateEvent" as any)
        .mockImplementation(() => BattleEventType.Miss);

      // @ts-ignore
      await hitTarget.hit(testCharacter, testNPC);

      expect(testNPC.health).toBe(testNPC.maxHealth);
    });

    it("NPC should clear its target, after killing a character", async () => {
      jest.useFakeTimers({
        advanceTimers: true,
      });

      jest
        // @ts-ignore
        .spyOn(hitTarget.battleEvent, "calculateEvent" as any)
        .mockImplementation(() => BattleEventType.Hit);
      // @ts-ignore
      jest.spyOn(hitTarget.battleDamageCalculator, "calculateHitDamage" as any).mockImplementation(() => 200);

      // @ts-ignore
      const charDeath = jest.spyOn(hitTarget.battleAttackTargetDeath, "handleDeathAfterHit");

      testCharacter.health = 1;
      (await Character.findByIdAndUpdate(testCharacter._id, testCharacter).lean()) as ICharacter;

      // @ts-ignore
      await hitTarget.hit(testNPC, testCharacter);

      expect(charDeath).toHaveBeenCalled();

      expect(testNPC.targetCharacter).toBe(undefined);
    });

    it("should increase magic resistance when a isMagic npc attacks a character", async () => {
      // we have to mock this part to simulate a successful hit
      jest
        // @ts-ignore
        .spyOn(hitTarget.battleEvent, "calculateEvent" as any)
        .mockImplementation(() => BattleEventType.Hit);
      // @ts-ignore
      jest.spyOn(hitTarget.battleDamageCalculator, "calculateHitDamage" as any).mockImplementation(() => 200);

      // @ts-ignore
      const increaseMagicResistSpy = jest.spyOn(hitTarget.skillIncrease, "increaseMagicResistanceSP");

      const magicNPC = await unitTestHelper.createMockNPC(
        {
          key: "minotaur-mage", // this mob has a isMagic property on the blueprint
        },
        { hasSkills: true }
      );

      // move it close to the character
      magicNPC.x = FromGridX(1);
      magicNPC.y = FromGridX(1);

      await magicNPC.save();

      await hitTarget.hit(magicNPC, targetCharacter);

      expect(increaseMagicResistSpy).toHaveBeenCalled();
    });
  });

  describe("EntityEffects", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should always call applyEntity when weapon has entityEffect and entity effect chance is 100", async () => {
      fireSwordItem.entityEffectChance = 100;
      // @ts-ignore
      // prettier-ignore
      const applyEntityEffects = jest.spyOn(hitTarget.entityEffectUse, "applyEntityEffects" as any).mockResolvedValue(undefined);

      // @ts-ignore
      await hitTarget.applyEntity(attackerCharacter, testNPC, fireSwordItem);

      expect(applyEntityEffects).toBeCalledWith(attackerCharacter, testNPC);
    });

    it("should not call applyEntity when weapon has entityEffect and entity effect chance is 0", async () => {
      fireSwordItem.entityEffectChance = 0;
      // @ts-ignore
      // prettier-ignore
      const applyEntityEffects = jest.spyOn(hitTarget.entityEffectUse, "applyEntityEffects" as any).mockResolvedValue(undefined);

      // @ts-ignore
      await hitTarget.applyEntity(attackerCharacter, testNPC, fireSwordItem);

      expect(applyEntityEffects).not.toHaveBeenCalled();
    });

    it("should not call applyEntity when weapon has  no entityEffect", async () => {
      fireSwordItem.entityEffectChance = 100;
      // @ts-ignore
      // prettier-ignore
      const applyEntityEffects = jest.spyOn(hitTarget.entityEffectUse, "applyEntityEffects" as any).mockResolvedValue(undefined);

      // @ts-ignore
      await hitTarget.applyEntity(attackerCharacter, testNPC, bowItem);

      expect(applyEntityEffects).not.toHaveBeenCalled();
    });

    it("should call applyEntityEffects if npc has entityEffects", async () => {
      testNPC.entityEffects = ["a", "b"];
      // @ts-ignore
      // prettier-ignore
      const applyEntityEffects = jest.spyOn(hitTarget.entityEffectUse, "applyEntityEffects" as any).mockResolvedValue(undefined);

      // @ts-ignore
      await hitTarget.applyEntityEffectsIfApplicable(testNPC, targetCharacter);

      expect(applyEntityEffects).toHaveBeenCalled();
    });

    it("should  call apply effects one time for the weapon", async () => {
      // @ts-ignore
      applyEntitySpy = jest.spyOn(hitTarget, "applyEntity");

      // @ts-ignore
      findByIdSpy = jest.spyOn(Item, "findById");

      const mockWeapon = { item: fireSwordItem };

      // @ts-ignore
      await hitTarget.applyEntityEffectsCharacter(attackerCharacter, mockWeapon, testNPC);

      expect(applyEntitySpy).toHaveBeenCalledWith(testNPC, attackerCharacter, fireSwordItem);
      expect(applyEntitySpy).toBeCalledTimes(1);
    });

    it("should call applyEntityEffectsCharacter if the attacker is a Character and target is a Character", async () => {
      // @ts-ignore
      const applyEntityEffectsCharacter = jest.spyOn(hitTarget, "applyEntityEffectsCharacter");
      // @ts-ignore
      jest.spyOn(hitTarget.battleEvent, "calculateEvent" as any).mockImplementation(() => BattleEventType.Hit);
      // @ts-ignore
      jest.spyOn(hitTarget.battleDamageCalculator, "calculateHitDamage" as any).mockImplementation(() => 50);

      const mockWeapon = { item: fireSwordItem };
      // @ts-ignore
      getWeaponSpy = jest.spyOn(hitTarget.characterWeapon, "getWeapon").mockImplementation(() => mockWeapon);

      // @ts-ignore
      // prettier-ignore
      const applyEntityEffectsIfApplicable = jest.spyOn(hitTarget, "applyEntityEffectsIfApplicable").mockResolvedValue(undefined);

      await hitTarget.hit(attackerCharacter, targetCharacter);

      // return weapon on getWeapon

      expect(applyEntityEffectsCharacter).toHaveBeenCalledWith(attackerCharacter, mockWeapon, targetCharacter);
      expect(applyEntityEffectsIfApplicable).not.toHaveBeenCalled();
    });

    it("should call applyEntityEffectsIfApplicable if the attacker is a npc", async () => {
      // @ts-ignore
      jest.spyOn(hitTarget.battleEvent, "calculateEvent" as any).mockImplementation(() => BattleEventType.Hit);
      // @ts-ignore
      jest.spyOn(hitTarget.battleDamageCalculator, "calculateHitDamage" as any).mockImplementation(() => 50);
      // @ts-ignore
      // prettier-ignore
      const applyEntityEffectsCharacter = jest.spyOn(hitTarget, "applyEntityEffectsCharacter").mockResolvedValue(undefined);
      // @ts-ignore
      // prettier-ignore
      const applyEntityEffectsIfApplicable = jest.spyOn(hitTarget, "applyEntityEffectsIfApplicable").mockResolvedValue(undefined);

      // @ts-ignore
      await hitTarget.hit(testNPC, targetCharacter);

      expect(applyEntityEffectsIfApplicable).toHaveBeenCalledWith(testNPC, targetCharacter);
      expect(applyEntityEffectsCharacter).not.toHaveBeenCalled();
    });
  });

  describe("magic staff ranged attack", () => {
    beforeEach(async () => {
      const characterEquipment = (await Equipment.findById(attackerCharacter.equipment).lean()) as IEquipment;
      const res = await unitTestHelper.createMockItemFromBlueprint(StaffsBlueprint.FireStaff);
      characterEquipment.rightHand = res.id;

      (await Equipment.findByIdAndUpdate(characterEquipment._id, characterEquipment).lean()) as IEquipment;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("when battle event is a hit, it should increase target magic resistance", async () => {
      // @ts-ignore
      jest.spyOn(hitTarget.battleEvent, "calculateEvent" as any).mockImplementation(() => BattleEventType.Hit);
      // @ts-ignore
      jest.spyOn(hitTarget.battleDamageCalculator, "calculateHitDamage" as any).mockImplementation(() => 50);

      // @ts-ignore
      const increaseSkillsOnBattle = jest.spyOn(hitTarget.skillIncrease, "increaseMagicResistanceSP" as any);

      await hitTarget.hit(attackerCharacter, targetCharacter);

      expect(increaseSkillsOnBattle).toHaveBeenCalledWith(targetCharacter, 24);
    });
  });

  it("should correctly apply critical hit multiplier", async () => {
    const baseDamage = 50;
    const criticalHitMultiplier = 1.8;
    const expectedDamage = baseDamage * criticalHitMultiplier;

    jest
      // @ts-ignore
      .spyOn(hitTarget.battleEvent, "calculateEvent" as any)
      .mockImplementation(() => BattleEventType.Hit);
    // @ts-ignore
    jest.spyOn(hitTarget.battleDamageCalculator, "calculateHitDamage" as any).mockImplementation(() => baseDamage);
    jest
      // @ts-ignore
      .spyOn(hitTarget.battleDamageCalculator, "getCriticalHitDamageIfSucceed" as any)
      .mockImplementation((damage) => expectedDamage);

    await hitTarget.hit(attackerCharacter, targetCharacter);

    expect(targetCharacter.health).toBeLessThan(targetCharacter.maxHealth);
    expect(targetCharacter.health).toBe(targetCharacter.maxHealth - expectedDamage);
  });

  it("should handle NaN damage by setting damage to 0", async () => {
    jest
      // @ts-ignore
      .spyOn(hitTarget.battleEvent, "calculateEvent" as any)
      .mockImplementation(() => BattleEventType.Hit);
    // @ts-ignore
    jest.spyOn(hitTarget.battleDamageCalculator, "calculateHitDamage" as any).mockImplementation(() => NaN);

    // Mock generateBloodOnGround
    const generateBloodOnGroundMock = jest
      // @ts-ignore
      .spyOn(hitTarget.battleEffects, "generateBloodOnGround")
      // @ts-ignore
      .mockImplementation(() => {});

    await hitTarget.hit(attackerCharacter, targetCharacter);

    expect(targetCharacter.health).toBe(targetCharacter.maxHealth);
    expect(generateBloodOnGroundMock).not.toHaveBeenCalled();
  });

  it("should correctly apply bonus damage", async () => {
    const baseDamage = 50;
    const bonusDamage = 10;
    const expectedDamage = baseDamage + bonusDamage * BONUS_DAMAGE_MULTIPLIER;

    jest
      // @ts-ignore
      .spyOn(hitTarget.battleEvent, "calculateEvent" as any)
      .mockImplementation(() => BattleEventType.Hit);
    // @ts-ignore
    jest.spyOn(hitTarget.battleDamageCalculator, "calculateHitDamage" as any).mockImplementation(() => baseDamage);

    await hitTarget.hit(attackerCharacter, targetCharacter, false, bonusDamage);

    expect(targetCharacter.health).toBe(targetCharacter.maxHealth - expectedDamage);
  });
  it("should correctly handle mana shield absorbing damage", async () => {
    const baseDamage = 50;

    jest
      // @ts-ignore
      .spyOn(hitTarget.battleEvent, "calculateEvent" as any)
      .mockImplementation(() => BattleEventType.Hit);

    // Mock calculateHitDamage to return consistent base damage
    jest
      // @ts-ignore
      .spyOn(hitTarget.battleDamageCalculator, "calculateHitDamage" as any)
      .mockReturnValue(baseDamage);

    // Ensure mana shield is present and it fully absorbs the damage
    jest
      // @ts-ignore
      .spyOn(hitTarget.manaShield, "hasManaShield" as any)
      .mockResolvedValue(true);

    jest
      // @ts-ignore
      .spyOn(hitTarget.manaShield, "handleManaShield" as any)
      .mockResolvedValue(true); // Shield absorbs full damage

    // Mock generateBloodOnGround to avoid its call since damage is absorbed
    const generateBloodOnGroundMock = jest
      // @ts-ignore
      .spyOn(hitTarget.battleEffects, "generateBloodOnGround" as any)
      .mockImplementation(() => {});

    // Execute the hit
    await hitTarget.hit(attackerCharacter, targetCharacter);

    // Assertions
    expect(targetCharacter.health).toBe(targetCharacter.maxHealth);
    expect(generateBloodOnGroundMock).not.toHaveBeenCalled();
  });

  it("should handle edge cases with target health", async () => {
    const baseDamage = 50;

    // Test when health is at maximum
    targetCharacter.health = targetCharacter.maxHealth;

    jest
      // @ts-ignore
      .spyOn(hitTarget.battleEvent, "calculateEvent" as any)
      .mockImplementation(() => BattleEventType.Hit);
    // @ts-ignore
    jest.spyOn(hitTarget.battleDamageCalculator, "calculateHitDamage" as any).mockImplementation(() => baseDamage);

    await hitTarget.hit(attackerCharacter, targetCharacter);

    expect(targetCharacter.health).toBe(targetCharacter.maxHealth - baseDamage);

    // Test when health is at minimum
    targetCharacter.health = 1;

    await hitTarget.hit(attackerCharacter, targetCharacter);

    expect(targetCharacter.health).toBe(0);
  });

  it("should emit battle events correctly", async () => {
    const baseDamage = 50;

    jest
      // @ts-ignore
      .spyOn(hitTarget.battleEvent, "calculateEvent" as any)
      .mockImplementation(() => BattleEventType.Hit);
    // @ts-ignore
    jest.spyOn(hitTarget.battleDamageCalculator, "calculateHitDamage" as any).mockImplementation(() => baseDamage);

    // @ts-ignore
    const sendEventSpy = jest.spyOn(hitTarget.socketMessaging, "sendEventToCharactersAroundCharacter");

    await hitTarget.hit(attackerCharacter, targetCharacter);

    expect(sendEventSpy).toHaveBeenCalled();
  });
});
