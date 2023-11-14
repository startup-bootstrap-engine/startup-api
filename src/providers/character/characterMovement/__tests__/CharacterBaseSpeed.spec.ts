import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { container, unitTestHelper } from "@providers/inversify/container";
import { UserAccountTypes } from "@providers/user/userTypes";
import { CharacterBaseSpeed } from "../CharacterBaseSpeed";

describe("CharacterBaseSpeed", () => {
  let characterBaseSpeed: CharacterBaseSpeed;
  let testCharacter: ICharacter;

  const LOW_LEVEL = 10;
  const MID_LEVEL = 70;
  const HIGH_LEVEL = 100;
  const VERY_HIGH_LEVEL = 150;

  const setupSkillsForCharacter = async (character: ICharacter, level: number): Promise<ISkill> => {
    const skills = (await Skill.findById(character.skills)) as ISkill;
    skills.level = level;
    await skills.save();
    return skills;
  };

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasSkills: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  beforeAll(() => {
    characterBaseSpeed = container.get(CharacterBaseSpeed);
  });

  it("Should return undefined when there are no skills", async () => {
    testCharacter.skills = undefined;

    const baseSpeed = await characterBaseSpeed.getBaseSpeed(testCharacter);
    expect(baseSpeed).toBeUndefined();
  });

  it("Should return correct base speed when the character level is above 50", async () => {
    await setupSkillsForCharacter(testCharacter, HIGH_LEVEL);

    const baseSpeedFast = await characterBaseSpeed.getBaseSpeed(testCharacter);
    expect(baseSpeedFast).toBeCloseTo(2.86);

    await setupSkillsForCharacter(testCharacter, VERY_HIGH_LEVEL);
    const baseSpeedExtraFast = await characterBaseSpeed.getBaseSpeed(testCharacter);
    expect(baseSpeedExtraFast).toBe(MovementSpeed.Fast);
  });

  it("Should add buff to base speed when the character level is above 50", async () => {
    await setupSkillsForCharacter(testCharacter, HIGH_LEVEL);
    const buffValue = 2;
    const buff = jest.fn().mockReturnValue([{ trait: "baseSpeed", absoluteChange: buffValue }]);
    // @ts-ignore
    jest.spyOn(characterBaseSpeed.characterBuffSkill, "calculateAllActiveBuffs").mockImplementation(buff);

    const baseSpeedFast = await characterBaseSpeed.getBaseSpeed(testCharacter);
    expect(baseSpeedFast).toBeCloseTo(4.86);

    await setupSkillsForCharacter(testCharacter, VERY_HIGH_LEVEL);
    const baseSpeedExtraFast = await characterBaseSpeed.getBaseSpeed(testCharacter);
    expect(baseSpeedExtraFast).toBe(MovementSpeed.Fast + buffValue);
  });

  it("Should return MIN speed when character level is LOW", async () => {
    await setupSkillsForCharacter(testCharacter, LOW_LEVEL);
    const baseSpeed = await characterBaseSpeed.getBaseSpeed(testCharacter);
    expect(baseSpeed).toBe(MovementSpeed.Standard);
  });

  it("should return MAX speed when character level is VERY_HIGH_LEVEL", async () => {
    await setupSkillsForCharacter(testCharacter, VERY_HIGH_LEVEL);
    const baseSpeed = await characterBaseSpeed.getBaseSpeed(testCharacter);
    expect(baseSpeed).toBe(MovementSpeed.Fast);
  });

  it("Should interpolate speed correctly for mid-level character", async () => {
    await setupSkillsForCharacter(testCharacter, MID_LEVEL);
    const baseSpeed = await characterBaseSpeed.getBaseSpeed(testCharacter);
    const expectedSpeed = 2.77;
    expect(baseSpeed).toBeCloseTo(expectedSpeed);
  });

  it("Should return extra fast speed when character level is above 150", async () => {
    await setupSkillsForCharacter(testCharacter, HIGH_LEVEL);
    const baseSpeed = await characterBaseSpeed.getBaseSpeed(testCharacter);
    expect(baseSpeed).toBe(2.86);
  });

  describe("Premium Account", () => {
    let goldenPremiumAccountCharacter: ICharacter;
    let bronzePremiumAccountCharacter: ICharacter;

    beforeEach(async () => {
      goldenPremiumAccountCharacter = await unitTestHelper.createMockCharacter(null, {
        isPremiumAccountType: UserAccountTypes.PremiumGold,
        hasSkills: true,
      });
      bronzePremiumAccountCharacter = await unitTestHelper.createMockCharacter(null, {
        isPremiumAccountType: UserAccountTypes.PremiumBronze,
        hasSkills: true,
      });
    });

    it("should return a ExtraFast speed if premium account is Golden", async () => {
      await setupSkillsForCharacter(goldenPremiumAccountCharacter, VERY_HIGH_LEVEL);
      const baseSpeed = await characterBaseSpeed.getBaseSpeed(goldenPremiumAccountCharacter);

      expect(baseSpeed).toBe(MovementSpeed.ExtraFast);
    });

    it("should return a Fast speed if premium account is Bronze", async () => {
      await setupSkillsForCharacter(bronzePremiumAccountCharacter, VERY_HIGH_LEVEL);

      const baseSpeed = await characterBaseSpeed.getBaseSpeed(bronzePremiumAccountCharacter);

      expect(baseSpeed).toBe(MovementSpeed.Fast);
    });
  });
});
