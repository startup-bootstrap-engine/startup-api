import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills, IGuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { GuildSkillsIncrease } from "../GuildSkillsIncrease";

describe("GuildSkillsIncrease.ts", () => {
  let guildSkillsIncrease: GuildSkillsIncrease;
  let testCharacter: ICharacter;
  let testGuild: IGuild;
  let guildSkills: IGuildSkills;

  const mockSocketMessaging = {
    sendEventToUser: jest.fn(),
  };

  beforeAll(() => {
    guildSkillsIncrease = container.get<GuildSkillsIncrease>(GuildSkillsIncrease);
  });

  beforeEach(async () => {
    testGuild = await unitTestHelper.createMockGuild();
    testCharacter = await unitTestHelper.createMockCharacter();

    guildSkills = new GuildSkills({
      owner: testGuild._id,
      guildPoints: 0,
      guildPointsToNextLevel: 100,
      upgradeTokens: 0,
    });
    await guildSkills.save();

    testGuild.members = [testCharacter._id];
    testGuild.guildLeader = testCharacter._id;
    testGuild.guildSkills = guildSkills._id;
    await testGuild.save();

    // @ts-ignore
    guildSkillsIncrease.socketMessaging = mockSocketMessaging;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("increaseGuildSkills", () => {
    it("should increase guild points without affecting level or upgradeTokens when below threshold", async () => {
      const skillPoints = 50; // Below the threshold for guildPointsToNextLevel
      // @ts-ignore
      const notifyGuildMembersSpy = jest.spyOn(guildSkillsIncrease.guildCommon, "notifyGuildMembers");

      await guildSkillsIncrease.increaseGuildSkills(guildSkills, skillPoints);

      const newGuildSkills = await GuildSkills.findOne({ _id: guildSkills._id });

      expect(newGuildSkills?.guildPoints).toEqual(skillPoints);
      expect(newGuildSkills?.upgradeTokens).toEqual(0);
      expect(newGuildSkills?.level).toEqual(guildSkills.level);
      expect(newGuildSkills?.guildPointsToNextLevel).toEqual(guildSkills.guildPointsToNextLevel);
      expect(notifyGuildMembersSpy).not.toHaveBeenCalled();
    });

    it("should increase upgradeTokens when guildPoints exceed guildPointsToNextLevel", async () => {
      const skillPoints = guildSkills.guildPointsToNextLevel + 10; // Exceeding the threshold
      // @ts-ignore
      const notifyGuildMembersSpy = jest.spyOn(guildSkillsIncrease.guildCommon, "notifyGuildMembers");

      const applyXPBonusForGuildLevelSpy = jest
        // @ts-ignore
        .spyOn<any, any>(guildSkillsIncrease.guildLevelBonusXP, "applyXPBonusForGuildLevel");
      const applyCharacterBuffSpy = jest
        // @ts-ignore
        .spyOn<any, any>(guildSkillsIncrease.guildLevelBonus, "applyCharacterBuff")
        .mockResolvedValueOnce(null);

      await guildSkillsIncrease.increaseGuildSkills(guildSkills, skillPoints);

      const newGuildSkills = await GuildSkills.findOne({ _id: guildSkills._id });

      expect(newGuildSkills?.guildPoints).toEqual(skillPoints);
      expect(newGuildSkills?.upgradeTokens).toEqual(guildSkills.upgradeTokens + 1);
      expect(notifyGuildMembersSpy).toHaveBeenCalled();

      const callArgs = notifyGuildMembersSpy.mock.calls[0];
      expect(callArgs[0]).toEqual(expect.arrayContaining(testGuild.members));
      expect(callArgs[0].length).toBe(testGuild.members.length);
      expect(applyXPBonusForGuildLevelSpy).toHaveBeenCalled();
      expect(applyCharacterBuffSpy).toHaveBeenCalled();
    });

    it("should not send level up message if guild is not found", async () => {
      // @ts-ignore
      jest.spyOn(Guild, "findOne").mockResolvedValueOnce({
        lean: jest.fn().mockResolvedValueOnce(null),
      });

      const updateOneSpy = jest.spyOn(GuildSkills, "updateOne").mockImplementation();

      await guildSkillsIncrease.increaseGuildSkills(guildSkills, 150);

      expect(updateOneSpy).toHaveBeenCalled();
      expect(mockSocketMessaging.sendEventToUser).not.toHaveBeenCalled();
    });

    it("should handle increasing guild points and not level up if below threshold", async () => {
      const skillPoints = guildSkills.guildPointsToNextLevel - 10; // Below the threshold
      const updateOneSpy = jest.spyOn(GuildSkills, "updateOne").mockImplementation();

      await guildSkillsIncrease.increaseGuildSkills(guildSkills, skillPoints);

      expect(updateOneSpy).toHaveBeenCalledWith(
        { _id: guildSkills._id },
        {
          $set: {
            guildPoints: skillPoints,
            level: guildSkills.level,
            guildPointsToNextLevel: guildSkills.guildPointsToNextLevel,
            upgradeTokens: guildSkills.upgradeTokens,
          },
        }
      );
      expect(mockSocketMessaging.sendEventToUser).not.toHaveBeenCalled();
    });
  });

  describe("getGuildSkills", () => {
    it("should return guild skills", async () => {
      // @ts-ignore
      jest.spyOn(Guild, "findOne").mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(testGuild),
      });
      const result = await guildSkillsIncrease.getGuildSkills(testCharacter);

      expect(result?._id).toEqual(guildSkills._id);
    });

    it("should return null if guild is not found", async () => {
      // @ts-ignore
      jest.spyOn(Guild, "findOne").mockImplementationOnce(() => ({
        lean: jest.fn().mockResolvedValueOnce(null),
      }));
      const result = await guildSkillsIncrease.getGuildSkills(testCharacter);
      expect(result).toBeNull();
    });
  });
});
