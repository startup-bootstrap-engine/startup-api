import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterClass } from "@rpg-engine/shared";
import { BattleCharacterAttackIntervalSpeed } from "../BattleCharacterAttackIntervalSpeed";

describe("BattleCharacterAttackIntervalSpeed", () => {
  let battleCharacterAttackIntervalSpeed: BattleCharacterAttackIntervalSpeed;
  let hunterCharacter: ICharacter;

  beforeAll(() => {
    battleCharacterAttackIntervalSpeed = container.get<BattleCharacterAttackIntervalSpeed>(
      BattleCharacterAttackIntervalSpeed
    );
  });

  beforeEach(async () => {
    // Create a mock character
    hunterCharacter = await unitTestHelper.createMockCharacter(
      {
        health: 100,
        x: 0,
        y: 0,
        class: CharacterClass.Hunter,
        attackIntervalSpeed: 1700, // Default attack speed
      },
      { hasSkills: true }
    );
  });

  it("should reduce attackIntervalSpeed for Hunter character based on skill level", async () => {
    const skillLevel = 10; // Skill level for test
    await Skill.findByIdAndUpdate(hunterCharacter.skills, { level: skillLevel });

    const reducedSpeed = await battleCharacterAttackIntervalSpeed.tryReducingAttackIntervalSpeed(hunterCharacter);

    expect(reducedSpeed).toBe(1673);
  });

  it("should reduce attackIntervalSpeed even further if level is higher", async () => {
    const skillLevel = 50; // Higher skill level

    await Skill.findByIdAndUpdate(hunterCharacter.skills, { level: skillLevel });

    const reducedSpeed = await battleCharacterAttackIntervalSpeed.tryReducingAttackIntervalSpeed(hunterCharacter);

    expect(reducedSpeed).toBe(1564);
  });

  it("should not reduce attackIntervalSpeed for non-Hunter character", async () => {
    hunterCharacter.class = CharacterClass.Warrior;
    const originalSpeed = hunterCharacter.attackIntervalSpeed;

    const reducedSpeed = await battleCharacterAttackIntervalSpeed.tryReducingAttackIntervalSpeed(hunterCharacter);

    expect(reducedSpeed).toBe(originalSpeed);
  });

  it("should apply a maximum of 80% reduction for high-level Hunter character skills", async () => {
    const highSkillLevel = 1000; // High skill level
    await Skill.findByIdAndUpdate(hunterCharacter.skills, { level: highSkillLevel });

    const reducedSpeed = await battleCharacterAttackIntervalSpeed.tryReducingAttackIntervalSpeed(hunterCharacter);

    expect(reducedSpeed).toBe(1360);
  });

  it("should not reduce attackIntervalSpeed when no skills are found", async () => {
    const originalSpeed = hunterCharacter.attackIntervalSpeed;

    await Skill.deleteOne({ owner: hunterCharacter._id });

    const reducedSpeed = await battleCharacterAttackIntervalSpeed.tryReducingAttackIntervalSpeed(hunterCharacter);

    expect(reducedSpeed).toBe(originalSpeed);
  });
});
