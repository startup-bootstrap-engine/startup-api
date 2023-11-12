import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterBaseSpeed } from "../CharacterBaseSpeed";

describe("CharacterBaseSpeed", () => {
  let characterBaseSpeed: CharacterBaseSpeed;
  let testCharacter: ICharacter;

  const LEVEL_THRESHOLD = 50;
  const HIGH_LEVEL = 51;
  const VERY_HIGH_LEVEL = 151;

  const setupSkillsForCharacter = async (level: number): Promise<ISkill> => {
    const skills = (await Skill.findById(testCharacter.skills)) as ISkill;
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
  });

  beforeAll(() => {
    characterBaseSpeed = container.get(CharacterBaseSpeed);
  });

  it("Should return undefined when there are no skills", async () => {
    testCharacter.skills = undefined;

    const baseSpeed = await characterBaseSpeed.getBaseSpeed(testCharacter);
    expect(baseSpeed).toBeUndefined();
  });

  it("Should return undefined when the character level is 50 or less", async () => {
    await setupSkillsForCharacter(LEVEL_THRESHOLD);

    const baseSpeed = await characterBaseSpeed.getBaseSpeed(testCharacter);
    expect(baseSpeed).toBeUndefined();
  });

  it("Should return correct base speed when the character level is above 50", async () => {
    await setupSkillsForCharacter(HIGH_LEVEL);

    const baseSpeedFast = await characterBaseSpeed.getBaseSpeed(testCharacter);
    expect(baseSpeedFast).toBe(MovementSpeed.Fast);

    await setupSkillsForCharacter(VERY_HIGH_LEVEL);
    const baseSpeedExtraFast = await characterBaseSpeed.getBaseSpeed(testCharacter);
    expect(baseSpeedExtraFast).toBe(MovementSpeed.ExtraFast);
  });

  it("Should add buff to base speed when the character level is above 50", async () => {
    await setupSkillsForCharacter(HIGH_LEVEL);
    const buffValue = 1;
    const buff = jest.fn().mockReturnValue([{ trait: "baseSpeed", absoluteChange: buffValue }]);
    // @ts-ignore
    jest.spyOn(characterBaseSpeed.characterBuffSkill, "calculateAllActiveBuffs").mockImplementation(buff);

    const baseSpeedFast = await characterBaseSpeed.getBaseSpeed(testCharacter);
    expect(baseSpeedFast).toBe(MovementSpeed.Fast + buffValue);

    await setupSkillsForCharacter(VERY_HIGH_LEVEL);
    const baseSpeedExtraFast = await characterBaseSpeed.getBaseSpeed(testCharacter);
    expect(baseSpeedExtraFast).toBe(MovementSpeed.ExtraFast + buffValue);
  });
});
