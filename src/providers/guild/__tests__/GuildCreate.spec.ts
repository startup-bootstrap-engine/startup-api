import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { GuildSocketEvents, IGuildForm, UserAccountTypes } from "@rpg-engine/shared";
import { GuildCreate } from "../GuildCreate";

describe("GuildCreate.ts", () => {
  let testGuild: IGuild;
  let testCharacter: ICharacter;
  let guildCreate: GuildCreate;

  const mockSocketMessaging = {
    sendEventToUser: jest.fn(),
    sendErrorMessageToCharacter: jest.fn(),
    sendMessageToCharacter: jest.fn(),
  };

  const mockGuildValidation = {
    validateGuildName: jest.fn(),
    validateGuildTag: jest.fn(),
  };

  beforeAll(() => {
    guildCreate = container.get<GuildCreate>(GuildCreate);
  });

  beforeEach(async () => {
    testGuild = await unitTestHelper.createMockGuild();
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true });

    // @ts-ignore
    guildCreate.socketMessaging = mockSocketMessaging;
    // @ts-ignore
    guildCreate.guildValidation = mockGuildValidation;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("validateGuild", () => {
    it("should return if basic validation fails", async () => {
      // @ts-ignore
      guildCreate.characterValidation.hasBasicValidation = jest.fn().mockReturnValue(false);

      // @ts-ignore
      await guildCreate.validateGuild(testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).not.toBeCalled();
      expect(mockSocketMessaging.sendEventToUser).not.toBeCalled();
    });

    it("should send error if character is not premium", async () => {
      // @ts-ignore
      guildCreate.characterValidation.hasBasicValidation = jest.fn().mockReturnValue(true);
      // @ts-ignore
      guildCreate.characterPremiumAccount.getPremiumAccountType = jest.fn().mockResolvedValue(UserAccountTypes.Free);

      // @ts-ignore
      await guildCreate.validateGuild(testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, you must be a premium user to create guilds."
      );
    });

    it("should send error if character does not have enough gold", async () => {
      // @ts-ignore
      guildCreate.characterValidation.hasBasicValidation = jest.fn().mockReturnValue(true);
      // @ts-ignore
      guildCreate.characterPremiumAccount.getPremiumAccountType = jest
        .fn()
        .mockResolvedValue(UserAccountTypes.PremiumBronze);

      // @ts-ignore
      guildCreate.characterTradingBalance.getTotalGoldInInventory = jest.fn().mockResolvedValue(50000);

      // @ts-ignore
      await guildCreate.validateGuild(testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, you must have at least 100000 gold to create guilds."
      );
    });

    it("should send event to user if validation passes", async () => {
      // @ts-ignore
      guildCreate.characterValidation.hasBasicValidation = jest.fn().mockReturnValue(true);
      // @ts-ignore
      guildCreate.characterPremiumAccount.getPremiumAccountType = jest
        .fn()
        .mockResolvedValue(UserAccountTypes.PremiumBronze);

      // @ts-ignore
      guildCreate.characterTradingBalance.getTotalGoldInInventory = jest.fn().mockResolvedValue(100000);

      // @ts-ignore
      await guildCreate.validateGuild(testCharacter);

      expect(mockSocketMessaging.sendEventToUser).toBeCalledWith(
        testCharacter.channelId!,
        GuildSocketEvents.CanCreateGuild,
        true
      );
    });
  });

  describe("createGuild", () => {
    let guildData: IGuildForm;
    beforeEach(() => {
      guildData = {
        guildName: "test",
        guildTag: "testTag",
        guildCoatOfArms: "testCoatOfArms",
      };

      // Mock the validateGuild method to pass validation
      // @ts-ignore
      guildCreate.validateGuild = jest.fn().mockResolvedValue(undefined);

      // Mock the guild validation to pass
      mockGuildValidation.validateGuildName.mockReturnValue({ isValid: true });
      mockGuildValidation.validateGuildTag.mockReturnValue({ isValid: true });
    });

    it("should send error if character is already in a guild", async () => {
      // @ts-ignore
      guildCreate.guildCommon.getCharactersGuild = jest.fn().mockResolvedValue(testGuild);

      await guildCreate.createGuild(guildData, testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
        testCharacter,
        "Sorry, You are already in a guild."
      );
    });

    it("should send error if guild name or tag already exists", async () => {
      // @ts-ignore
      guildCreate.guildCommon.getCharactersGuild = jest.fn().mockResolvedValue(null);

      jest.spyOn(Guild, "findOne").mockResolvedValue(testGuild as any);

      await guildCreate.createGuild(guildData, testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
        testCharacter,
        "Sorry, Guild name or tag already exists."
      );
    });

    it("should create guild and send success message", async () => {
      // @ts-ignore
      guildCreate.guildCommon.getCharactersGuild = jest.fn().mockResolvedValue(null);
      jest.spyOn(Guild, "findOne").mockResolvedValue(null);
      // @ts-ignore
      jest.spyOn(Guild, "create").mockResolvedValue(testGuild as any);

      const guildLevelBonusSpy = jest
        // @ts-ignore
        .spyOn(guildCreate.guildLevelBonus, "applyCharacterBuff")
        .mockReturnValue({} as any);
      // @ts-ignore
      guildCreate.characterItemInventory.decrementItemFromNestedInventoryByKey = jest
        .fn()
        .mockResolvedValue({ success: true });
      // @ts-ignore
      guildCreate.guildCommon.convertToGuildInfo = jest.fn().mockResolvedValue({});
      // @ts-ignore
      const sendMessageToAllMembersSpy = jest
        // @ts-ignore
        .spyOn(guildCreate.guildCommon, "sendMessageToAllMembers")
        .mockResolvedValue();

      await guildCreate.createGuild(guildData, testCharacter);

      // @ts-ignore
      expect(sendMessageToAllMembersSpy).toBeCalledWith(
        "Guild " + testGuild.name + " was Created successfully.",
        testGuild
      );

      expect(guildLevelBonusSpy).toBeCalledWith(testCharacter, 1);
    });

    it("should send error if guild creation fails", async () => {
      // @ts-ignore
      guildCreate.guildCommon.getCharactersGuild = jest.fn().mockResolvedValue(null);
      jest.spyOn(Guild, "findOne").mockResolvedValue(null);
      // @ts-ignore
      jest.spyOn(Guild, "create").mockRejectedValue(new Error("Database error"));

      await guildCreate.createGuild(guildData, testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(testCharacter, "Error creating guild.");
    });

    it("should send error if guild name is invalid", async () => {
      mockGuildValidation.validateGuildName.mockReturnValue({ isValid: false, message: "Invalid guild name" });

      await guildCreate.createGuild(guildData, testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(testCharacter, "Invalid guild name");
    });

    it("should send error if guild tag is invalid", async () => {
      mockGuildValidation.validateGuildTag.mockReturnValue({ isValid: false, message: "Invalid guild tag" });

      await guildCreate.createGuild(guildData, testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(testCharacter, "Invalid guild tag");
    });
  });
});
