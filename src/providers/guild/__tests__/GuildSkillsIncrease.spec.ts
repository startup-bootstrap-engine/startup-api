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
    it("should level up and send message when guild points exceed guildPointsToNextLevel", async () => {
      const skillPoints = guildSkills.guildPointsToNextLevel + 10;
      // @ts-ignore
      const notifyGuildMembersSpy = jest.spyOn(guildSkillsIncrease.guildCommon, "notifyGuildMembers");
      await guildSkillsIncrease.increaseGuildSkills(guildSkills, skillPoints);

      const newGuildSkills = await GuildSkills.findOne({ _id: guildSkills._id });

      expect(newGuildSkills?.guildPoints).toEqual(skillPoints);
      expect(notifyGuildMembersSpy).toHaveBeenCalled();

      const callArgs = notifyGuildMembersSpy.mock.calls[0];
      expect(callArgs[0]).toEqual(expect.arrayContaining(testGuild.members));
      expect(callArgs[0].length).toBe(testGuild.members.length);
      expect(callArgs[1]).toBe(newGuildSkills?.level);
    });

    it("should not send level up message if guild is not found", async () => {
      jest.spyOn(Guild, "findOne").mockResolvedValueOnce(null);
      const updateOneSpy = jest.spyOn(GuildSkills, "updateOne").mockImplementation();

      await guildSkillsIncrease.increaseGuildSkills(guildSkills, 150);

      expect(updateOneSpy).toHaveBeenCalled();
      expect(mockSocketMessaging.sendEventToUser).not.toHaveBeenCalled();
    });

    it("should increase guild skills without leveling up", async () => {
      const updateOneSpy = jest.spyOn(GuildSkills, "updateOne").mockImplementation();
      const skillPoints = guildSkills.guildPointsToNextLevel - 10;

      await guildSkillsIncrease.increaseGuildSkills(guildSkills, skillPoints);

      expect(updateOneSpy).toHaveBeenCalledWith(
        { _id: guildSkills._id },
        {
          $set: {
            guildPoints: skillPoints,
            level: guildSkills.level,
            guildPointsToNextLevel: guildSkills.guildPointsToNextLevel,
          },
        }
      );
      expect(mockSocketMessaging.sendEventToUser).not.toHaveBeenCalled();
    });
  });

  describe("getGuildSkills", () => {
    it("should return guild skills", async () => {
      // @ts-ignore
      jest.spyOn(Guild, "findOne").mockResolvedValueOnce(testGuild);
      const result = await guildSkillsIncrease.getGuildSkills(testCharacter);
      expect(result?.id).toEqual(guildSkills.id);
    });

    it("should return null if guild is not found", async () => {
      jest.spyOn(Guild, "findOne").mockResolvedValueOnce(null);
      const result = await guildSkillsIncrease.getGuildSkills(testCharacter);
      expect(result).toBeNull();
    });
  });
});
