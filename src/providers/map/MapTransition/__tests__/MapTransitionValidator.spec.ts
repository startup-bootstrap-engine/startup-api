import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { ITiledObject } from "@rpg-engine/shared";
import { MapTransitionInfo } from "../MapTransitionInfo";
import { MapTransitionValidator } from "../MapTransitionValidator";

describe("MapTransitionValidator", () => {
  let mapTransitionValidator: MapTransitionValidator;
  let mockSocketMessaging: SocketMessaging;
  let mockMapTransitionInfo: MapTransitionInfo;
  let testCharacter: ICharacter;
  let mockTransitionTiledObj: ITiledObject;

  beforeAll(() => {
    mockSocketMessaging = {
      sendErrorMessageToCharacter: jest.fn(),
    } as unknown as SocketMessaging;

    mockMapTransitionInfo = {
      getTransitionProperty: jest.fn(),
    } as unknown as MapTransitionInfo;

    mapTransitionValidator = new MapTransitionValidator(mockSocketMessaging, mockMapTransitionInfo);
  });

  beforeEach(() => {
    testCharacter = { id: "test-id", name: "Test Character" } as ICharacter;
    mockTransitionTiledObj = { properties: {} } as ITiledObject;
  });

  describe("isPremiumAccountRequired", () => {
    it("should return true if accountType property is present", () => {
      (mockMapTransitionInfo.getTransitionProperty as jest.Mock).mockReturnValue("premium");

      const result = mapTransitionValidator.isPremiumAccountRequired(mockTransitionTiledObj);

      expect(result).toBe(true);
      expect(mockMapTransitionInfo.getTransitionProperty).toHaveBeenCalledWith(mockTransitionTiledObj, "accountType");
    });

    it("should return false if accountType property is not present", () => {
      (mockMapTransitionInfo.getTransitionProperty as jest.Mock).mockReturnValue(null);

      const result = mapTransitionValidator.isPremiumAccountRequired(mockTransitionTiledObj);

      expect(result).toBe(false);
      expect(mockMapTransitionInfo.getTransitionProperty).toHaveBeenCalledWith(mockTransitionTiledObj, "accountType");
    });
  });

  describe("isUserAllowedAccess", () => {
    it("should return true if user account type is allowed", () => {
      (mockMapTransitionInfo.getTransitionProperty as jest.Mock).mockReturnValue("premium");

      const result = mapTransitionValidator.isUserAllowedAccess(mockTransitionTiledObj, "premium");

      expect(result).toBe(true);
      expect(mockMapTransitionInfo.getTransitionProperty).toHaveBeenCalledWith(mockTransitionTiledObj, "accountType");
    });

    it("should return false if user account type is not allowed", () => {
      (mockMapTransitionInfo.getTransitionProperty as jest.Mock).mockReturnValue("premium");

      const result = mapTransitionValidator.isUserAllowedAccess(mockTransitionTiledObj, "basic");

      expect(result).toBe(false);
      expect(mockMapTransitionInfo.getTransitionProperty).toHaveBeenCalledWith(mockTransitionTiledObj, "accountType");
    });

    it("should return false if accountType property is not present", () => {
      (mockMapTransitionInfo.getTransitionProperty as jest.Mock).mockReturnValue(null);

      const result = mapTransitionValidator.isUserAllowedAccess(mockTransitionTiledObj, "premium");

      expect(result).toBe(false);
      expect(mockMapTransitionInfo.getTransitionProperty).toHaveBeenCalledWith(mockTransitionTiledObj, "accountType");
    });
  });

  describe("sendAccessErrorMessage", () => {
    it("should send an error message with the allowed account types", () => {
      (mockMapTransitionInfo.getTransitionProperty as jest.Mock).mockReturnValue("premium,VIP");

      mapTransitionValidator.sendAccessErrorMessage(testCharacter, mockTransitionTiledObj);

      expect(mockMapTransitionInfo.getTransitionProperty).toHaveBeenCalledWith(mockTransitionTiledObj, "accountType");
      expect(mockSocketMessaging.sendErrorMessageToCharacter).toHaveBeenCalledWith(
        testCharacter,
        "Sorry, a premium account of type 'Premium, or Vip' is required to access this area."
      );
    });
  });
});
