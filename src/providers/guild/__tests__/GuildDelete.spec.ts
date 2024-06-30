import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import mongoose from "mongoose";
import { GuildDelete } from "../GuildDelete";

describe("GuildDelete.ts", () => {
  let guildDelete: GuildDelete;
  let testGuild: IGuild;
  let testCharacter: ICharacter;

  const mockSocketMessaging = {
    sendEventToUser: jest.fn(),
    sendErrorMessageToCharacter: jest.fn(),
    sendMessageToCharacter: jest.fn(),
  };

  beforeAll(() => {
    guildDelete = container.get<GuildDelete>(GuildDelete);
  });

  beforeEach(async () => {
    testGuild = await unitTestHelper.createMockGuild();
    testCharacter = await unitTestHelper.createMockCharacter();

    testGuild.members = [testCharacter._id];
    testGuild.guildLeader = testCharacter._id;
    await testGuild.save();

    // @ts-ignore
    guildDelete.socketMessaging = mockSocketMessaging;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("deleteGuild", () => {
    it("should send error if guild is not found", async () => {
      jest.spyOn(Guild, "findById").mockResolvedValueOnce(null);

      await guildDelete.deleteGuild(testGuild._id, testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, guild not found."
      );
    });

    it("should send error if character is not the guild leader", async () => {
      jest.spyOn(Guild, "findById").mockResolvedValueOnce(testGuild as any);

      testGuild.guildLeader = mongoose.Types.ObjectId().toString();
      await testGuild.save();

      await guildDelete.deleteGuild(testGuild._id, testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, you are not the leader of this guild."
      );
    });

    it("should delete guild skills if they exist", async () => {
      jest.spyOn(Guild, "findById").mockResolvedValueOnce(testGuild as any);
      jest.spyOn(GuildSkills, "findOne").mockResolvedValueOnce({ id: "guild-skills-id" } as any);
      const deleteGuildSkillsSpy = jest.spyOn(GuildSkills, "deleteOne").mockResolvedValueOnce({ deletedCount: 1 });

      await guildDelete.deleteGuild(testGuild._id, testCharacter);

      expect(deleteGuildSkillsSpy).toHaveBeenCalledWith({ _id: "guild-skills-id" });
    });

    it("should delete the guild and send messages to members", async () => {
      jest.spyOn(Guild, "findById").mockResolvedValueOnce(testGuild as any);
      jest.spyOn(GuildSkills, "findOne").mockResolvedValueOnce(null);
      const deleteGuildSpy = jest.spyOn(Guild, "deleteOne").mockResolvedValueOnce({ deletedCount: 1 });
      const sendMessageToAllMembersSpy = jest
        // @ts-ignore
        .spyOn<any, any>(guildDelete.guildCommon, "sendMessageToAllMembers")
        .mockResolvedValueOnce(null);

      await guildDelete.deleteGuild(testGuild._id, testCharacter);

      expect(deleteGuildSpy).toHaveBeenCalledWith({ _id: testGuild._id });
      expect(sendMessageToAllMembersSpy).toHaveBeenCalledWith(
        "The guild has been deleted by the leader.",
        testGuild,
        true
      );
    });
  });
});
