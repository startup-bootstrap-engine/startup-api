import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { CharacterBuffActivator } from "@providers/character/characterBuff/CharacterBuffActivator";
import { container, unitTestHelper } from "@providers/inversify/container";
import { BasicAttribute, CharacterBuffDurationType, CharacterBuffType, CraftingSkill } from "@rpg-engine/shared";
import { SkillUpdaterQueue } from "../SkillUpdaterQueue";

describe("SkillFunctions", () => {
  let testCharacter: ICharacter;
  let skillFunctions: SkillUpdaterQueue;

  beforeAll(() => {
    skillFunctions = container.get<SkillUpdaterQueue>(SkillUpdaterQueue);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasSkills: true,
    });
    await testCharacter.populate("skills").execPopulate();
  });

  it("calculateBonusOrPenaltiesSP should return the correct value", async () => {
    const numberBonus = 0.1; // 10%
    const numberPenalties = -0.1; // -10%

    const fishingSkill = 2;

    await Skill.findByIdAndUpdate(testCharacter.skills, {
      fishing: {
        level: fishingSkill,
      },
    });

    const resultBonus = skillFunctions.calculateBonusOrPenaltiesSP(numberBonus, fishingSkill);
    const resultPenalties = skillFunctions.calculateBonusOrPenaltiesSP(numberPenalties, fishingSkill);

    expect(resultBonus).toEqual(0.44);
    expect(resultPenalties).toEqual(0.36);
  });

  it("calculateBonusOrPenaltiesMagicSP should return the correct value", async () => {
    const numberBonus = 0.1; // 10%
    const numberPenalties = -0.1; // -10%

    const magicLevel = 2;

    await Skill.findByIdAndUpdate(testCharacter.skills, {
      magic: {
        level: magicLevel,
      },
    });

    const resultBonus = skillFunctions.calculateBonusOrPenaltiesMagicSP(numberBonus, magicLevel);
    const resultPenalties = skillFunctions.calculateBonusOrPenaltiesMagicSP(numberPenalties, magicLevel);

    expect(resultBonus).toEqual(0.88);
    expect(resultPenalties).toEqual(0.72);
  });

  it("should update the skill points", async () => {
    const skill = (await Skill.findById(testCharacter.skills)) as ISkill;
    const skillType = "strength";
    const bonusOrPenalties = 10;

    const skillLevelUp = skillFunctions.updateSkillByType(skill, skillType, bonusOrPenalties);

    expect(skillLevelUp).toEqual(false);
    expect(skill[skillType].skillPoints).toEqual(bonusOrPenalties);
    expect(skill[skillType].skillPointsToNextLevel).toBe(12);
    expect(skill[skillType].level).toEqual(1);
  });

  it("should calculate the bonus correctly", async () => {
    const testCases = [
      {
        skills: new Skill({
          ownerType: "Character",
          level: 1,
        }),
        exp: 0,
      },
      {
        skills: new Skill({
          ownerType: "Character",
          level: 51,
        }),
        exp: 1,
      },
      {
        skills: new Skill({
          ownerType: "Character",
          level: 101,
        }),
        exp: 2,
      },
    ];
    for (const tc of testCases) {
      const res = await tc.skills.save();
      const bonus = await skillFunctions.calculateBonus(res.level);
      expect(bonus).toEqual(tc.exp);
    }
  });

  it("should update base speed when increase skill level", async () => {
    const skill = (await Skill.findById(testCharacter.skills)) as ISkill;
    skill.level = 51;
    const baseSpeed = testCharacter.baseSpeed;

    await skillFunctions.updateSkills(skill, testCharacter);

    const updatedCharacter = await Character.findById(testCharacter.id);

    expect(updatedCharacter?.baseSpeed).toBeGreaterThan(baseSpeed);
  });

  describe("Bonus and penalties x Buff edge cases", () => {
    let characterBuffActivator: CharacterBuffActivator;

    beforeAll(() => {
      characterBuffActivator = container.get<CharacterBuffActivator>(CharacterBuffActivator);
    });

    beforeEach(async () => {
      testCharacter = await unitTestHelper.createMockCharacter(null, {
        hasEquipment: true,
        hasSkills: true,
      });
    });

    it("buffs should not impact the calculateBonusOrPenaltiesSP calculation", async () => {
      const numberBonus = 0.1; // 10%
      const numberPenalties = -0.1; // -10%

      await Skill.findByIdAndUpdate(testCharacter.skills, {
        fishing: {
          level: 2,
        },
      });

      await characterBuffActivator.enablePermanentBuff(testCharacter, {
        type: CharacterBuffType.Skill,
        trait: CraftingSkill.Fishing,
        buffPercentage: 10,
        durationType: CharacterBuffDurationType.Permanent,
      });

      const skills = (await Skill.findById(testCharacter.skills).lean()) as ISkill;

      const fishingSkill = skills.fishing.level;

      const resultBonus = skillFunctions.calculateBonusOrPenaltiesSP(numberBonus, fishingSkill);
      const resultPenalties = skillFunctions.calculateBonusOrPenaltiesSP(numberPenalties, fishingSkill);

      expect(resultBonus).toEqual(0.44);
      expect(resultPenalties).toEqual(0.36);
    });

    it("buffs should not impact the calculateBonusOrPenaltiesMagicSP calculation", async () => {
      const numberBonus = 0.1; // 10%
      const numberPenalties = -0.1; // -10%

      await Skill.findByIdAndUpdate(testCharacter.skills, {
        magic: {
          level: 2,
        },
      });

      await characterBuffActivator.enablePermanentBuff(testCharacter, {
        type: CharacterBuffType.Skill,
        trait: BasicAttribute.Magic,
        buffPercentage: 10,
        durationType: CharacterBuffDurationType.Permanent,
      });

      const skills = (await Skill.findById(testCharacter.skills).lean()) as ISkill;

      const resultBonus = await skillFunctions.calculateBonusOrPenaltiesMagicSP(numberBonus, skills.magic.level);
      const resultPenalties = await skillFunctions.calculateBonusOrPenaltiesMagicSP(
        numberPenalties,
        skills.magic.level
      );

      expect(resultBonus).toEqual(0.88);
      expect(resultPenalties).toEqual(0.72);
    });
  });
});
