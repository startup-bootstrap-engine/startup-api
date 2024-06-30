import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import _ from "lodash";
import { CalculateEffectDamage } from "../CalculateEffectDamage";

describe("CalculateEffectDamage", () => {
  let calculateEffectDamage: CalculateEffectDamage;
  let testAttacker: INPC;
  let testCharacterAttacker: ICharacter;
  let testTarget: ICharacter;

  beforeEach(async () => {
    calculateEffectDamage = container.get<CalculateEffectDamage>(CalculateEffectDamage);
    testAttacker = await unitTestHelper.createMockNPC(
      {
        key: "rat",
      },
      { hasSkills: true }
    );
    testCharacterAttacker = await unitTestHelper.createMockCharacter(null, { hasSkills: true });
    testTarget = await unitTestHelper.createMockCharacter(null, { hasSkills: true });

    const testAttackerSkills = (await Skill.findById(testAttacker.skills)) as ISkill;
    testAttackerSkills.level = 50;
    testAttackerSkills.resistance.level = 12;
    testAttackerSkills.magicResistance.level = 14;
    testAttackerSkills.magic.level = 10;

    await testAttackerSkills.save();

    const testCharacterAttackerSkills = (await Skill.findById(testCharacterAttacker.skills)) as ISkill;
    testCharacterAttackerSkills.level = 50;
    testCharacterAttackerSkills.resistance.level = 12;
    testCharacterAttackerSkills.magicResistance.level = 14;
    testCharacterAttackerSkills.magic.level = 10;

    await testCharacterAttackerSkills.save();

    const testTargetSkills = (await Skill.findById(testTarget.skills)) as ISkill;
    testTargetSkills.level = 3;
    testTargetSkills.resistance.level = 2;
    testTargetSkills.magicResistance.level = 4;

    await testTargetSkills.save();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should return correct damage when attacker is Character", async () => {
    const spyGetTargetResistance = jest.spyOn(CalculateEffectDamage.prototype as any, "getTargetResistances");
    const spyCalculateTotalEffectDamage = jest.spyOn(
      CalculateEffectDamage.prototype as any,
      "calculateTotalEffectDamage"
    );

    await testCharacterAttacker.populate("skills").execPopulate();
    await testTarget.populate("skills").execPopulate();

    const result = await calculateEffectDamage.calculateEffectDamage(testCharacterAttacker, testTarget);

    expect(spyGetTargetResistance).toHaveBeenCalledTimes(1);
    expect(spyCalculateTotalEffectDamage).toHaveBeenCalledWith(testCharacterAttacker, 50, 1, 10, 1, 2, 4, undefined);
    expect(result).toBeLessThanOrEqual(50);
  });

  it("should return correct damage when attacker is NPC", async () => {
    const mockRandom = jest.spyOn(_, "random");
    mockRandom.mockReturnValueOnce(5).mockReturnValueOnce(10);

    const spyGetTargetResistance = jest.spyOn(CalculateEffectDamage.prototype as any, "getTargetResistances");
    const spyCalculateTotalEffectDamage = jest.spyOn(
      CalculateEffectDamage.prototype as any,
      "calculateTotalEffectDamage"
    );

    await testAttacker.populate("skills").execPopulate();
    await testTarget.populate("skills").execPopulate();

    const result = await calculateEffectDamage.calculateEffectDamage(testAttacker, testTarget);

    expect(spyGetTargetResistance).toHaveBeenCalledTimes(1);
    expect(spyCalculateTotalEffectDamage).toHaveBeenCalledWith(testAttacker, 50, 1, 10, 1, 2, 4, undefined);
    expect(result).toBeLessThanOrEqual(15);
  });

  it("should handle low-level attacker correctly", async () => {
    const lowLevelSkills = (await Skill.findById(testCharacterAttacker.skills)) as ISkill;
    lowLevelSkills.level = 1;
    await lowLevelSkills.save();

    await testCharacterAttacker.populate("skills").execPopulate();
    await testTarget.populate("skills").execPopulate();

    const result = await calculateEffectDamage.calculateEffectDamage(testCharacterAttacker, testTarget);

    expect(result).toBeLessThanOrEqual(10);
  });

  it("should handle high resistance target correctly", async () => {
    const targetSkills = (await Skill.findById(testTarget.skills)) as ISkill;
    targetSkills.resistance.level = 100;
    targetSkills.magicResistance.level = 100;
    await targetSkills.save();

    await testCharacterAttacker.populate("skills").execPopulate();
    await testTarget.populate("skills").execPopulate();

    const result = await calculateEffectDamage.calculateEffectDamage(testCharacterAttacker, testTarget);

    expect(result).toBeGreaterThanOrEqual(1);
  });

  it("should return min damage if an error occurs", async () => {
    jest.spyOn(CalculateEffectDamage.prototype as any, "getTargetResistances").mockImplementation(() => {
      throw new Error("Test error");
    });

    await testCharacterAttacker.populate("skills").execPopulate();
    await testTarget.populate("skills").execPopulate();

    const result = await calculateEffectDamage.calculateEffectDamage(testCharacterAttacker, testTarget);

    expect(result).toEqual(1);
  });

  it("should apply bonus damage correctly", async () => {
    const spyCalculateTotalEffectDamage = jest.spyOn(
      CalculateEffectDamage.prototype as any,
      "calculateTotalEffectDamage"
    );

    await testCharacterAttacker.populate("skills").execPopulate();
    await testTarget.populate("skills").execPopulate();

    const result = await calculateEffectDamage.calculateEffectDamage(testCharacterAttacker, testTarget, {
      maxBonusDamage: 5,
      finalBonusDamage: 3,
    });

    expect(spyCalculateTotalEffectDamage).toHaveBeenCalledWith(testCharacterAttacker, 50, 1, 10, 1, 2, 4, {
      maxBonusDamage: 5,
      finalBonusDamage: 3,
    });

    expect(result).toBeGreaterThan(1);
  });

  it("should handle NPC with magic correctly", async () => {
    const attackerSkills = (await Skill.findById(testAttacker.skills)) as ISkill;
    attackerSkills.magic.level = 50;
    await attackerSkills.save();

    const spyCalculateTotalEffectDamage = jest.spyOn(
      CalculateEffectDamage.prototype as any,
      "calculateTotalEffectDamage"
    );

    await testAttacker.populate("skills").execPopulate();
    await testTarget.populate("skills").execPopulate();

    const result = await calculateEffectDamage.calculateEffectDamage(testAttacker, testTarget);

    expect(spyCalculateTotalEffectDamage).toHaveBeenCalledWith(testAttacker, 50, 1, 50, 1, 2, 4, undefined);
    expect(result).toBeGreaterThan(0.4);
  });
});
