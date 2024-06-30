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

    it("should send guild invite and confirmation message if all conditions are met", async () => {
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
    });
  });
});
