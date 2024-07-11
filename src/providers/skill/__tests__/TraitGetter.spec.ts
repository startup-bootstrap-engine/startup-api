import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { CharacterBuffActivator } from "@providers/character/characterBuff/CharacterBuffActivator";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { container, unitTestHelper } from "@providers/inversify/container";
import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  CharacterClass,
  CraftingSkill,
} from "@rpg-engine/shared";
import { TraitGetter } from "../TraitGetter";

describe("TraitGetter", () => {
  let traitGetter: TraitGetter;
  let testCharacter: ICharacter;
  let characterBuffActivator: CharacterBuffActivator;
  let inMemoryHashTable: InMemoryHashTable;

  beforeAll(() => {
    traitGetter = container.get<TraitGetter>(TraitGetter);
    characterBuffActivator = container.get<CharacterBuffActivator>(CharacterBuffActivator);
    inMemoryHashTable = container.get<InMemoryHashTable>(InMemoryHashTable);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasSkills: true,
    });

    await testCharacter.populate("skills").execPopulate();
    jest.clearAllMocks();
  });

  describe("Class bonus and penalties", () => {
    it("should properly get a skill trait with class bonus and penalties applied", async () => {
      testCharacter.class = CharacterClass.Berserker;
      await testCharacter.save();

      const result = await traitGetter.getSkillLevelWithBuffs(testCharacter.skills as ISkill, BasicAttribute.Strength);

      expect(result).toEqual(1.2);
    });

    it("should handle multiple class bonuses correctly", async () => {
      testCharacter.class = CharacterClass.Berserker;
      await testCharacter.save();

      await characterBuffActivator.enablePermanentBuff(testCharacter, {
        type: CharacterBuffType.Skill,
        trait: BasicAttribute.Strength,
        buffPercentage: 10,
        durationType: CharacterBuffDurationType.Permanent,
      });

      const result = await traitGetter.getSkillLevelWithBuffs(testCharacter.skills as ISkill, BasicAttribute.Strength);

      expect(result).toBeCloseTo(1.3, 2); // Allow for small floating-point differences
    });
  });

  describe("Skills getter", () => {
    it("should return a character skill without buff applied", async () => {
      const result = await traitGetter.getSkillLevelWithBuffs(testCharacter.skills as ISkill, CraftingSkill.Fishing);

      expect(result).toEqual(1);
    });

    it("should return a character skill with the buff applied", async () => {
      await characterBuffActivator.enablePermanentBuff(testCharacter, {
        type: CharacterBuffType.Skill,
        trait: CraftingSkill.Fishing,
        buffPercentage: 10,
        durationType: CharacterBuffDurationType.Permanent,
      });

      const result = await traitGetter.getSkillLevelWithBuffs(testCharacter.skills as ISkill, CraftingSkill.Fishing);

      expect(result).toEqual(1.1);
    });

    it("should handle multiple buffs correctly", async () => {
      await characterBuffActivator.enablePermanentBuff(testCharacter, {
        type: CharacterBuffType.Skill,
        trait: CraftingSkill.Fishing,
        buffPercentage: 10,
        durationType: CharacterBuffDurationType.Permanent,
      });

      await characterBuffActivator.enablePermanentBuff(testCharacter, {
        type: CharacterBuffType.Skill,
        trait: CraftingSkill.Fishing,
        buffPercentage: 20,
        durationType: CharacterBuffDurationType.Permanent,
      });

      const result = await traitGetter.getSkillLevelWithBuffs(testCharacter.skills as ISkill, CraftingSkill.Fishing);

      expect(result).toEqual(1.3); // 1 (base) * 1.3 (10% + 20% buff)
    });

    it("should handle negative buffs correctly", async () => {
      await characterBuffActivator.enablePermanentBuff(testCharacter, {
        type: CharacterBuffType.Skill,
        trait: CraftingSkill.Fishing,
        buffPercentage: -15,
        durationType: CharacterBuffDurationType.Permanent,
      });

      const result = await traitGetter.getSkillLevelWithBuffs(testCharacter.skills as ISkill, CraftingSkill.Fishing);

      expect(result).toEqual(0.85); // 1 (base) * 0.85 (-15% buff)
    });
  });

  describe("Character attribute getter", () => {
    it("should return a character attribute without buff applied", async () => {
      const result = await traitGetter.getCharacterAttributeWithBuffs(
        testCharacter,
        CharacterAttributes.AttackIntervalSpeed
      );

      expect(result).toEqual(1700);
    });

    it("should return a character attribute with the buff applied", async () => {
      await characterBuffActivator.enablePermanentBuff(testCharacter, {
        type: CharacterBuffType.CharacterAttribute,
        trait: CharacterAttributes.AttackIntervalSpeed,
        buffPercentage: 10,
        durationType: CharacterBuffDurationType.Permanent,
      });

      const result = await traitGetter.getCharacterAttributeWithBuffs(
        testCharacter,
        CharacterAttributes.AttackIntervalSpeed
      );

      expect(result).toEqual(1870);
    });

    it("should handle multiple attribute buffs correctly", async () => {
      await characterBuffActivator.enablePermanentBuff(testCharacter, {
        type: CharacterBuffType.CharacterAttribute,
        trait: CharacterAttributes.AttackIntervalSpeed,
        buffPercentage: 10,
        durationType: CharacterBuffDurationType.Permanent,
      });

      await characterBuffActivator.enablePermanentBuff(testCharacter, {
        type: CharacterBuffType.CharacterAttribute,
        trait: CharacterAttributes.AttackIntervalSpeed,
        buffPercentage: 5,
        durationType: CharacterBuffDurationType.Permanent,
      });

      const result = await traitGetter.getCharacterAttributeWithBuffs(
        testCharacter,
        CharacterAttributes.AttackIntervalSpeed
      );

      expect(result).toEqual(1955); // 1700 * 1.15 (10% + 5% buff)
    });
  });

  describe("Error handling", () => {
    it("should throw an error when skills owner is undefined", async () => {
      const mockSkills = { owner: undefined } as ISkill;
      await expect(traitGetter.getSkillLevelWithBuffs(mockSkills, CraftingSkill.Fishing)).rejects.toThrow(
        "Skills owner is undefined"
      );
    });
  });
});
