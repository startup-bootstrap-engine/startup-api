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

  beforeAll(() => {
    guildCreate = container.get<GuildCreate>(GuildCreate);
  });

  beforeEach(async () => {
    testGuild = await unitTestHelper.createMockGuild();
    testCharacter = await unitTestHelper.createMockCharacter();

    // @ts-ignore
    guildCreate.socketMessaging = mockSocketMessaging;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("validateGuild", () => {
    it("should return if basic validation fails", async () => {
      // @ts-ignore
      guildCreate.characterValidation.hasBasicValidation = jest.fn().mockReturnValue(false);

      await guildCreate.validateGuild(testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).not.toBeCalled();
      expect(mockSocketMessaging.sendEventToUser).not.toBeCalled();
    });

    it("should send error if character is not premium", async () => {
      // @ts-ignore
      guildCreate.characterValidation.hasBasicValidation = jest.fn().mockReturnValue(true);
      // @ts-ignore
      guildCreate.characterPremiumAccount.getPremiumAccountType = jest.fn().mockResolvedValue(UserAccountTypes.Free);

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
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should send error if character is already in a guild", async () => {
      // @ts-ignore
      guildCreate.guildGet.getCharactersGuild = jest.fn().mockResolvedValue(testGuild);

      await guildCreate.createGuild(guildData, testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
        testCharacter,
        "Sorry, You are already in a guild."
      );
    });

    it("should send error if guild name or tag already exists", async () => {
      // @ts-ignore
      guildCreate.guildGet.getCharactersGuild = jest.fn().mockResolvedValue(null);

      jest.spyOn(Guild, "findOne").mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(testGuild),
      } as any);

      await guildCreate.createGuild(guildData, testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
        testCharacter,
        "Sorry, Guild name or tag already exists."
      );
    });

    it("should create guild and send success message", async () => {
      // @ts-ignore
      guildCreate.guildGet.getCharactersGuild = jest.fn().mockResolvedValue(null);

      await guildCreate.createGuild(guildData, testCharacter);

      expect(mockSocketMessaging.sendMessageToCharacter).toBeCalledWith(
        testCharacter,
        "Guild was Created successfully."
      );
    });

    it("should send error if guild creation fails", async () => {
      // @ts-ignore
      guildCreate.guildGet.getCharactersGuild = jest.fn().mockResolvedValue(null);

      jest.spyOn(Guild, "create").mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await guildCreate.createGuild(guildData, testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(testCharacter, "Error creating guild.");
    });
  });
});
