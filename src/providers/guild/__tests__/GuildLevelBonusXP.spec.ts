import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { GUILD_XP_BONUS } from "@providers/constants/GuildConstants";
import { container, unitTestHelper } from "@providers/inversify/container";
import { GuildLevelBonusXP } from "../GuildLevelBonusXP";

describe("GuildLevelBonusXP.ts", () => {
  let guildLevelBonusXP: GuildLevelBonusXP;
  let testCharacter: ICharacter;
  let characterSkills: ISkill;

  beforeAll(() => {
    guildLevelBonusXP = container.get<GuildLevelBonusXP>(GuildLevelBonusXP);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasSkills: true,
    });

    const skills = (await Skill.findById(testCharacter.skills).lean()) as ISkill;
    characterSkills = skills;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should apply XP bonus based on guild level", async () => {
    const guildLevel = 5;
    const expectedXPBonus = GUILD_XP_BONUS * guildLevel;

    await guildLevelBonusXP.applyXPBonusForGuildLevel(testCharacter, guildLevel);

    const updatedSkills = (await Skill.findById(testCharacter.skills).lean()) as ISkill;
    expect(updatedSkills.experience).toBe(characterSkills.experience + expectedXPBonus);
  });

  it("should not apply XP bonus if character skills are not found", async () => {
    const guildLevel = 5;

    const mockLeanFn = jest.fn().mockResolvedValue(null);
    jest.spyOn(Skill, "findById").mockReturnValue({ lean: mockLeanFn } as any);

    await guildLevelBonusXP.applyXPBonusForGuildLevel(testCharacter, guildLevel);

    expect(Skill.findById).toHaveBeenCalledWith(testCharacter.skills);
    const updatedSkills = (await Skill.findOne({
      _id: testCharacter.skills,
    }).lean()) as ISkill;
    expect(updatedSkills.experience).toBe(characterSkills.experience);
  });
});
