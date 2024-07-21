import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterUser } from "@providers/character/CharacterUser";
import { container } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { ITiledObject, IUser } from "@rpg-engine/shared";
import { MapTransitionInfo } from "../MapTransitionInfo";
import { IDestination } from "../MapTransitionQueue";
import { MapTransitionReferralBonus } from "../MapTransitionReferralBonus";
import { MapTransitionValidator } from "../MapTransitionValidator";
describe("MapTransitionValidator", () => {
  let mapTransitionValidator: MapTransitionValidator;
  let testCharacter: ICharacter;
  let mockTransitionTiledObj: ITiledObject;

  let getTransitionPropertySpy: jest.SpyInstance;
  let sendErrorMessageToCharacterSpy: jest.SpyInstance;
  let isSocialCrystalsCheckRequiredSpy: jest.SpyInstance;
  let doesCharacterHasEnoughCrystalsSpy: jest.SpyInstance;
  let findUserByCharacterSpy: jest.SpyInstance;

  beforeAll(() => {
    getTransitionPropertySpy = jest.spyOn(MapTransitionInfo.prototype, "getTransitionProperty");
    sendErrorMessageToCharacterSpy = jest.spyOn(SocketMessaging.prototype, "sendErrorMessageToCharacter");
    isSocialCrystalsCheckRequiredSpy = jest.spyOn(
      MapTransitionReferralBonus.prototype,
      "isSocialCrystalsCheckRequired"
    );
    doesCharacterHasEnoughCrystalsSpy = jest.spyOn(
      MapTransitionReferralBonus.prototype,
      "doesCharacterHasEnoughCrystals"
    );
    findUserByCharacterSpy = jest.spyOn(CharacterUser.prototype, "findUserByCharacter");

    mapTransitionValidator = container.get<MapTransitionValidator>(MapTransitionValidator);
  });

  beforeEach(() => {
    testCharacter = { id: "test-id", name: "Test Character", _id: "test-id", scene: "test-scene" } as ICharacter;
    mockTransitionTiledObj = { properties: {} } as ITiledObject;

    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("isMapTemporarilyBlocked", () => {
    it("should return true and send an error message if the map is temporarily blocked", () => {
      const destination = { map: "elf-continent_2" } as IDestination;
      const result = mapTransitionValidator.isMapTemporarilyBlocked(destination, testCharacter);

      expect(result).toBe(true);
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "This map is temporarily blocked due to technical issues. Please try again later."
      );
    });

    it("should return false if the map is not temporarily blocked", () => {
      const destination = { map: "not-blocked-map" } as IDestination;
      const result = mapTransitionValidator.isMapTemporarilyBlocked(destination, testCharacter);

      expect(result).toBe(false);
      expect(sendErrorMessageToCharacterSpy).not.toHaveBeenCalled();
    });
  });

  describe("checkHasEnoughSocialCrystalsIfRequired", () => {
    const mockUser: IUser = { accountType: "free" } as IUser;
    const mockDestination = { map: "test-map" } as IDestination;

    beforeEach(() => {
      findUserByCharacterSpy.mockResolvedValue(mockUser);
    });

    it("should return true if social crystals are not required", async () => {
      isSocialCrystalsCheckRequiredSpy.mockReturnValue(false);
      getTransitionPropertySpy.mockReturnValue(null);

      const result = await mapTransitionValidator.checkHasEnoughSocialCrystalsIfRequired(
        testCharacter,
        mockDestination
      );

      expect(result).toBe(true);
      expect(doesCharacterHasEnoughCrystalsSpy).not.toHaveBeenCalled();
    });

    it("should return false if social crystals are required but the character doesn't have enough", async () => {
      isSocialCrystalsCheckRequiredSpy.mockReturnValue(true);
      doesCharacterHasEnoughCrystalsSpy.mockResolvedValue(false);

      const result = await mapTransitionValidator.checkHasEnoughSocialCrystalsIfRequired(
        testCharacter,
        mockDestination
      );

      expect(result).toBe(false);
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "You do not have enough social crystals to proceed to this map."
      );
    });

    it("should return true if all checks pass", async () => {
      isSocialCrystalsCheckRequiredSpy.mockReturnValue(true);
      doesCharacterHasEnoughCrystalsSpy.mockResolvedValue(true);
      getTransitionPropertySpy.mockReturnValue(null);

      const result = await mapTransitionValidator.checkHasEnoughSocialCrystalsIfRequired(
        testCharacter,
        mockDestination
      );

      expect(result).toBe(true);
    });
  });

  describe("verifyPremiumAccountAccess", () => {
    const mockUser: IUser = { accountType: "free" } as IUser;

    beforeEach(() => {
      findUserByCharacterSpy.mockResolvedValue(mockUser);
    });

    it("should return true if premium account is not required", async () => {
      getTransitionPropertySpy.mockReturnValue(null);

      const result = await mapTransitionValidator.verifyPremiumAccountAccess(testCharacter, mockTransitionTiledObj);

      expect(result).toBe(true);
      expect(sendErrorMessageToCharacterSpy).not.toHaveBeenCalled();
    });

    it("should return false if premium account is required but user doesn't have access", async () => {
      getTransitionPropertySpy.mockReturnValue("premium");

      const result = await mapTransitionValidator.verifyPremiumAccountAccess(testCharacter, mockTransitionTiledObj);

      expect(result).toBe(false);
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, a premium account of type 'Premium' is required to access this area."
      );
    });

    it("should return true if premium account is required and user has access", async () => {
      // @ts-ignore
      mockUser.accountType = "premium";
      getTransitionPropertySpy.mockReturnValue("premium");

      const result = await mapTransitionValidator.verifyPremiumAccountAccess(testCharacter, mockTransitionTiledObj);

      expect(result).toBe(true);
      expect(sendErrorMessageToCharacterSpy).not.toHaveBeenCalled();
    });
  });

  describe("isPremiumAccountRequired", () => {
    it("should return true if accountType property is present", () => {
      getTransitionPropertySpy.mockReturnValue("premium");

      const result = mapTransitionValidator.isPremiumAccountRequired(mockTransitionTiledObj);

      expect(result).toBe(true);
      expect(getTransitionPropertySpy).toHaveBeenCalledWith(mockTransitionTiledObj, "accountType");
    });

    it("should return false if accountType property is not present", () => {
      getTransitionPropertySpy.mockReturnValue(null);

      const result = mapTransitionValidator.isPremiumAccountRequired(mockTransitionTiledObj);

      expect(result).toBe(false);
      expect(getTransitionPropertySpy).toHaveBeenCalledWith(mockTransitionTiledObj, "accountType");
    });
  });

  describe("isUserAllowedAccess", () => {
    it("should return true if user account type is allowed", () => {
      getTransitionPropertySpy.mockReturnValue("premium,vip");
      const result = mapTransitionValidator.isUserAllowedAccess(mockTransitionTiledObj, "premium");
      expect(result).toBe(true);
    });

    it("should return false if user account type is not allowed", () => {
      getTransitionPropertySpy.mockReturnValue("premium,vip");
      const result = mapTransitionValidator.isUserAllowedAccess(mockTransitionTiledObj, "free");
      expect(result).toBe(false);
    });

    it("should return true if no account types are specified", () => {
      getTransitionPropertySpy.mockReturnValue(null);
      const result = mapTransitionValidator.isUserAllowedAccess(mockTransitionTiledObj, "premium");
      expect(result).toBe(true);
    });
  });

  describe("sendAccessErrorMessage", () => {
    it("should send an error message with the allowed account types", () => {
      getTransitionPropertySpy.mockReturnValue("premium,VIP");

      mapTransitionValidator.sendAccessErrorMessage(testCharacter, mockTransitionTiledObj);

      expect(getTransitionPropertySpy).toHaveBeenCalledWith(mockTransitionTiledObj, "accountType");
      expect(sendErrorMessageToCharacterSpy).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, a premium account of type 'Premium, or Vip' is required to access this area."
      );
    });
  });
});
