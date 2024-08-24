import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills, IGuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { GuildSocketEvents, UISocketEvents } from "@rpg-engine/shared";
import mongoose from "mongoose";
import { GuildInvitation } from "../GuildInvitation";

describe("GuildInvitation.ts", () => {
  let guildInvitation: GuildInvitation;
  let testCharacter: ICharacter;
  let testGuild: IGuild;
  let testTargetCharacter: ICharacter;
  let guildSkills: IGuildSkills;

  const mockSocketMessaging = {
    sendEventToUser: jest.fn(),
    sendErrorMessageToCharacter: jest.fn(),
    sendMessageToCharacter: jest.fn(),
  };

  beforeAll(() => {
    guildInvitation = container.get<GuildInvitation>(GuildInvitation);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();
    testGuild = await unitTestHelper.createMockGuild();
    testTargetCharacter = await unitTestHelper.createMockCharacter();

    guildSkills = new GuildSkills({
      owner: testGuild._id,
    });
    await guildSkills.save();

    testGuild.guildLeader = testCharacter._id;
    testGuild.members = [testCharacter._id];
    testGuild.guildSkills = guildSkills._id;
    await testGuild.save();

    // @ts-ignore
    guildInvitation.socketMessaging = mockSocketMessaging;
  });

  describe("inviteToGuild", () => {
    it("should send error if guild is not found", async () => {
      const invalidGuildId = new mongoose.Types.ObjectId().toString();

      await guildInvitation.inviteToGuild(testCharacter, "anything", "anything", invalidGuildId);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(testCharacter, "Sorry, guild not found.");
    });

    it("should send error if character is not the leader", async () => {
      const leaderId = new mongoose.Types.ObjectId().toString();

      await guildInvitation.inviteToGuild(testCharacter, leaderId, "anything", testGuild._id);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
        testCharacter,
        "Sorry, you are not the leader of this guild, only the leader can invite people to the guild."
      );
    });

    it("should send error if target character is not found", async () => {
      const invalidtargetId = new mongoose.Types.ObjectId().toString();

      await guildInvitation.inviteToGuild(
        testCharacter,
        testGuild.guildLeader?.toString(),
        invalidtargetId,
        testGuild._id
      );

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(testCharacter, "Sorry, target not found.");
    });

    it("should send error if target character is already in a guild", async () => {
      await guildInvitation.inviteToGuild(
        testCharacter,
        testGuild.guildLeader?.toString(),
        testGuild.guildLeader?.toString(),
        testGuild._id.toString()
      );

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
        testCharacter,
        "Sorry, Your target is already in a guild."
      );
    });

    it("should send error if guild skills not found", async () => {
      jest.spyOn(GuildSkills, "findOne").mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(null) } as any);

      await guildInvitation.inviteToGuild(
        testCharacter,
        testGuild.guildLeader?.toString(),
        testTargetCharacter._id.toString(),
        testGuild._id.toString()
      );

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
        testCharacter,
        "Sorry, guild skills not found."
      );
    });

    it("should send error if guild is full", async () => {
      testGuild.members = [
        testCharacter._id,
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString(),
      ];

      await testGuild.save();

      await guildInvitation.inviteToGuild(
        testCharacter,
        testGuild.guildLeader?.toString(),
        testTargetCharacter._id.toString(),
        testGuild._id.toString()
      );

      // @ts-ignore
      const nextLevel = guildInvitation.nextUpgradeLevel(guildSkills.level, testGuild.members.length);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
        testCharacter,
        `Sorry, guild is full. Please upgrade your guild level to ${nextLevel} to get more members.`
      );
    });

    it("should send guild invite and confirmation message if all conditions are met", async () => {
      testGuild.members = [testCharacter._id];
      await testGuild.save();

      await guildInvitation.inviteToGuild(
        testCharacter,
        testGuild.guildLeader?.toString(),
        testTargetCharacter._id.toString(),
        testGuild._id.toString()
      );

      expect(mockSocketMessaging.sendEventToUser).toBeCalledWith(
        testTargetCharacter.channelId!,
        GuildSocketEvents.GuildInvite,
        {
          leaderId: testCharacter._id,
          leaderName: testCharacter.name,
        }
      );

      expect(mockSocketMessaging.sendEventToUser).toBeCalledWith(testCharacter.channelId!, UISocketEvents.ShowMessage, {
        message: `Send guild invite to ${testTargetCharacter.name}!`,
        type: "info",
      });
    });
  });

  describe("acceptInviteGuild", () => {
    it("should send error if targetId is missing", async () => {
      await guildInvitation.acceptInviteGuild(testTargetCharacter, "anything", undefined, undefined);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
        testTargetCharacter,
        "Sorry, character not found."
      );
    });

    it("should send error if guildId is provided", async () => {
      const guildId = new mongoose.Types.ObjectId().toString();

      await guildInvitation.acceptInviteGuild(
        testTargetCharacter,
        testGuild.guildLeader?.toString(),
        testTargetCharacter._id.toString(),
        guildId
      );

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
        testTargetCharacter,
        "Sorry, You are already in a guild."
      );
    });

    it("should send error if guild is not found", async () => {
      const leaderId = new mongoose.Types.ObjectId().toString();

      await guildInvitation.acceptInviteGuild(testTargetCharacter, leaderId, testTargetCharacter._id, undefined);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
        testTargetCharacter,
        "Sorry, guild not found."
      );
    });

    it("should add target to guild and send confirmation messages if all conditions are met", async () => {
      const sendMessageToAllMembersMock = jest.spyOn(
        // @ts-ignore
        guildInvitation.guildCommon,
        // @ts-ignore
        "sendMessageToAllMembers"
      );

      const applyCharacterBuffSpy = jest
        // @ts-ignore
        .spyOn<any, any>(guildInvitation.guildLevelBonus, "applyCharacterBuff")
        .mockResolvedValueOnce(null);

      await guildInvitation.acceptInviteGuild(
        testTargetCharacter,
        testGuild.guildLeader?.toString(),
        testTargetCharacter._id.toString(),
        undefined
      );

      const updatedGuild = (await Guild.findById(testGuild._id)) as IGuild;
      expect(updatedGuild?.members).toContain(testTargetCharacter._id.toString());
      expect(sendMessageToAllMembersMock).toHaveBeenCalledWith(
        `${testTargetCharacter.name} joined the guild!`,
        expect.objectContaining({
          _id: updatedGuild._id,
        })
      );
      expect(applyCharacterBuffSpy).toHaveBeenCalled();
    });
  });

  describe("maxGuildMembers", () => {
    const testCases = [
      { level: 1, expected: 10 },
      { level: 5, expected: 10 },
      { level: 10, expected: 10 },
      { level: 11, expected: 20 },
      { level: 20, expected: 20 },
      { level: 21, expected: 30 },
      { level: 50, expected: 50 },
      { level: 100, expected: 100 },
    ];

    test.each(testCases)("should return $expected for level $level", ({ level, expected }) => {
      // @ts-ignore
      expect(guildInvitation.maxGuildMembers(level)).toBe(expected);
    });

    it("should throw an error for invalid guild level", () => {
      // @ts-ignore
      expect(() => guildInvitation.maxGuildMembers(0)).toThrow("Guild level must be at least 1");
    });

    it("should return correct max members for a high guild level", () => {
      // @ts-ignore
      expect(guildInvitation.maxGuildMembers(150)).toBe(150);
    });
  });

  describe("nextUpgradeLevel", () => {
    const testCases = [
      {
        currentLevel: 1,
        currentMembers: 5,
        expected: 1,
        description: "return current level when members are below max",
      },
      {
        currentLevel: 10,
        currentMembers: 10,
        expected: 11,
        description: "return next level when members are at max",
      },
      {
        currentLevel: 20,
        currentMembers: 21,
        expected: 21,
        description: "return next level when members exceed max",
      },
      {
        currentLevel: 50,
        currentMembers: 40,
        expected: 50,
        description: "return current level for high level with low members",
      },
    ];

    test.each(testCases)("should $description", ({ currentLevel, currentMembers, expected }) => {
      // @ts-ignore
      expect(guildInvitation.nextUpgradeLevel(currentLevel, currentMembers)).toBe(expected);
    });

    it("should throw an error for invalid current level", () => {
      // @ts-ignore
      expect(() => guildInvitation.nextUpgradeLevel(0, 5)).toThrow("Current level must be at least 1");
    });

    it("should throw an error for negative current members", () => {
      // @ts-ignore
      expect(() => guildInvitation.nextUpgradeLevel(1, -1)).toThrow("Current members must be a non-negative number");
    });
  });
});
