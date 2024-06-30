import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { container } from "@providers/inversify/container";
import { GuildSocketEvents, IGuildInfo, UISocketEvents } from "@rpg-engine/shared";
import { GuildCommon } from "../GuildCommon";

describe("GuildCommon.ts", () => {
  let guildCommon: GuildCommon;

  const mockSocketMessaging = {
    sendEventToUser: jest.fn(),
    sendErrorMessageToCharacter: jest.fn(),
    sendMessageToCharacter: jest.fn(),
  };

  beforeAll(() => {
    guildCommon = container.get<GuildCommon>(GuildCommon);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    guildCommon.socketMessaging = mockSocketMessaging;
  });

  describe("getCharactersGuild", () => {
    it("should return a guild when character is a guild leader", async () => {
      const mockCharacter: ICharacter = { _id: "char1" } as ICharacter;
      // @ts-ignore
      const mockGuild: IGuild = { _id: "guild1", guildLeader: "char1", members: [] } as IGuild;
      // @ts-ignore
      jest.spyOn(Guild, "findOne").mockResolvedValue(mockGuild);

      const result = await guildCommon.getCharactersGuild(mockCharacter);

      expect(Guild.findOne).toHaveBeenCalledWith({
        $or: [{ guildLeader: "char1" }, { members: "char1" }],
      });
      expect(result).toEqual(mockGuild);
    });

    it("should return a guild when character is a guild member", async () => {
      const mockCharacter: ICharacter = { _id: "char2" } as ICharacter;
      // @ts-ignore
      const mockGuild: IGuild = { _id: "guild1", guildLeader: "char1", members: ["char2"] } as IGuild;
      // @ts-ignore
      jest.spyOn(Guild, "findOne").mockResolvedValue(mockGuild);

      const result = await guildCommon.getCharactersGuild(mockCharacter);

      expect(Guild.findOne).toHaveBeenCalledWith({
        $or: [{ guildLeader: "char2" }, { members: "char2" }],
      });
      expect(result).toEqual(mockGuild);
    });

    it("should return null when no guild is found", async () => {
      const mockCharacter: ICharacter = { _id: "char3" } as ICharacter;

      jest.spyOn(Guild, "findOne").mockResolvedValue(null);

      const result = await guildCommon.getCharactersGuild(mockCharacter);

      expect(Guild.findOne).toHaveBeenCalledWith({
        $or: [{ guildLeader: "char3" }, { members: "char3" }],
      });
      expect(result).toBeNull();
    });

    it("should throw an error when database operation fails", async () => {
      const mockCharacter: ICharacter = { _id: "char4" } as ICharacter;

      jest.spyOn(Guild, "findOne").mockRejectedValue(new Error("Database error"));

      await expect(guildCommon.getCharactersGuild(mockCharacter)).rejects.toThrow("Database error");
    });
  });

  describe("sendMessageToAllMembers", () => {
    const mockGuild: IGuild = {
      _id: "guild1",
      members: ["char1", "char2", "char3"],
    } as IGuild;

    const mockCharacters: { [key: string]: ICharacter } = {
      char1: { _id: "char1", channelId: "channel1" } as ICharacter,
      char2: { _id: "char2", channelId: "channel2" } as ICharacter,
      char3: { _id: "char3", channelId: "channel3" } as ICharacter,
    };

    beforeEach(() => {
      jest.spyOn(Character, "findById").mockImplementation(
        (id: string) =>
          ({
            lean: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(mockCharacters[id]),
          } as any)
      );

      // @ts-ignore
      jest.spyOn(guildCommon as any, "convertTOIGuildInfo").mockResolvedValue({ id: "guild1" } as IGuildInfo);
    });

    it("should send message to all guild members", async () => {
      await guildCommon.sendMessageToAllMembers("Test message", mockGuild);

      expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledTimes(6); // 2 calls per member
      expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledWith("channel1", UISocketEvents.ShowMessage, {
        message: "Test message",
        type: "info",
      });
      expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledWith("channel1", GuildSocketEvents.GuildInfoOpen, {
        id: "guild1",
      });

      expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledWith("channel2", GuildSocketEvents.GuildInfoOpen, {
        id: "guild1",
      });

      expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledWith("channel3", GuildSocketEvents.GuildInfoOpen, {
        id: "guild1",
      });
    });

    it("should not send GuildInfoOpen event when isDelete is true", async () => {
      await guildCommon.sendMessageToAllMembers("Guild deleted", mockGuild, true);

      expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledTimes(3 * 2); // 2 calls per member
      expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledWith("channel1", UISocketEvents.ShowMessage, {
        message: "Guild deleted",
        type: "info",
      });
      expect(mockSocketMessaging.sendEventToUser).not.toHaveBeenCalledWith(
        expect.anything(),
        GuildSocketEvents.GuildInfoOpen,
        expect.anything()
      );
    });

    it("should handle errors when sending messages", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Mock findById to throw an error for the first call only
      jest
        .spyOn(Character, "findById")
        .mockImplementationOnce(() => {
          return {
            lean: () => ({
              // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
              select: () => Promise.reject(new Error("Database error")),
            }),
          } as any;
        })
        .mockImplementation(
          (id: string) =>
            ({
              lean: jest.fn().mockReturnThis(),
              select: jest.fn().mockResolvedValue(mockCharacters[id]),
            } as any)
        );

      await guildCommon.sendMessageToAllMembers("Test message", mockGuild);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error sending message to character with ID char1:",
        expect.any(Error)
      );
      expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledTimes(4); // 2 calls for each of the other two members
    });
  });

  describe("notifyGuildMembers", () => {
    const mockCharacters: ICharacter[] = [
      { _id: "char1", channelId: "channel1" },
      { _id: "char2", channelId: "channel2" },
      { _id: "char3", channelId: null }, // Test case for character without channelId
    ] as ICharacter[];

    beforeEach(() => {
      jest.clearAllMocks();

      (Character.find as jest.Mock) = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockCharacters),
      });
    });

    it("should notify all guild members with valid channelId", async () => {
      const members = ["char1", "char2", "char3"];
      const newLevel = 5;

      await guildCommon.notifyGuildMembers(members, newLevel);

      expect(Character.find).toHaveBeenCalledWith({ _id: { $in: members } });
      expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledTimes(2); // Only for char1 and char2
      expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledWith("channel1", UISocketEvents.ShowMessage, {
        message: "Your guild level is now 5.",
        type: "info",
      });
      expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledWith("channel2", UISocketEvents.ShowMessage, {
        message: "Your guild level is now 5.",
        type: "info",
      });
    });

    it("should not send notification to members without channelId", async () => {
      const members = ["char3"];
      const newLevel = 5;

      // Override the mock for this specific test
      (Character.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([{ _id: "char3", channelId: null }]),
      });

      await guildCommon.notifyGuildMembers(members, newLevel);

      expect(Character.find).toHaveBeenCalledWith({ _id: { $in: members } });
      expect(mockSocketMessaging.sendEventToUser).not.toHaveBeenCalled();
    });

    it("should handle empty members array", async () => {
      const members: string[] = [];
      const newLevel = 5;

      // Override the mock for this specific test
      (Character.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([{ _id: "char3", channelId: null }]),
      });

      await guildCommon.notifyGuildMembers(members, newLevel);

      expect(Character.find).toHaveBeenCalledWith({ _id: { $in: members } });
      expect(mockSocketMessaging.sendEventToUser).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      const members = ["char1", "char2"];
      const newLevel = 5;

      const error = new Error("Database error");
      (Character.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        select: jest.fn().mockRejectedValue(error),
      });

      await expect(guildCommon.notifyGuildMembers(members, newLevel)).rejects.toThrow("Database error");
      expect(mockSocketMessaging.sendEventToUser).not.toHaveBeenCalled();
    });
  });
});
