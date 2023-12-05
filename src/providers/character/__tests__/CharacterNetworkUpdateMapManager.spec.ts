import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { ITiledObject } from "@rpg-engine/shared";
import { CharacterNetworkUpdateMapManager } from "../network/CharacterNetworkUpdate/CharacterNetworkUpdateMap";

describe("CharacterLastAction", () => {
  let characterNetworkUpdateMapManager: CharacterNetworkUpdateMapManager;
  let testCharacter: ICharacter;

  beforeAll(() => {
    characterNetworkUpdateMapManager = container.get(CharacterNetworkUpdateMapManager);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();
  });

  afterEach(async () => {});

  // Parameterized tests for various account types
  describe.each([
    { userAccountType: "free", allowedType: "free", shouldAccess: true },
    { userAccountType: "free", allowedType: "bronze", shouldAccess: false },
    { userAccountType: "free", allowedType: "silver", shouldAccess: false },
    { userAccountType: "free", allowedType: "gold", shouldAccess: false },
    { userAccountType: "free", allowedType: "ultimate", shouldAccess: false },
    { userAccountType: "bronze", allowedType: "bronze", shouldAccess: true },
    { userAccountType: "bronze", allowedType: "silver", shouldAccess: false },
    { userAccountType: "bronze", allowedType: "gold", shouldAccess: false },
    { userAccountType: "bronze", allowedType: "ultimate", shouldAccess: false },
    { userAccountType: "silver", allowedType: "bronze", shouldAccess: false },
    { userAccountType: "silver", allowedType: "silver", shouldAccess: true },
    { userAccountType: "silver", allowedType: "gold", shouldAccess: false },
    { userAccountType: "silver", allowedType: "ultimate", shouldAccess: false },
    { userAccountType: "gold", allowedType: "bronze", shouldAccess: false },
    { userAccountType: "gold", allowedType: "silver", shouldAccess: false },
    { userAccountType: "gold", allowedType: "gold", shouldAccess: true },
    { userAccountType: "gold", allowedType: "ultimate", shouldAccess: false },
    { userAccountType: "ultimate", allowedType: "bronze", shouldAccess: false },
    { userAccountType: "ultimate", allowedType: "silver", shouldAccess: false },
    { userAccountType: "ultimate", allowedType: "gold", shouldAccess: false },
    { userAccountType: "ultimate", allowedType: "ultimate", shouldAccess: true },
  ])("Access control tests", (testData) => {
    it(`should ${testData.shouldAccess ? "grant" : "restrict"} access for ${testData.userAccountType} user with ${
      testData.allowedType
    } required`, async () => {
      jest
        // @ts-ignore
        .spyOn(characterNetworkUpdateMapManager.characterUser, "findUserByCharacter")
        // @ts-ignore
        .mockResolvedValue({ accountType: testData.userAccountType });

      const mockReturnValue: ITiledObject = {
        name: "Transition",
        properties: [
          { name: "accountType", type: "string", value: testData.allowedType },
          { name: "gridX", type: "int", value: 45 },
          { name: "gridY", type: "int", value: 34 },
          { name: "map", type: "string", value: "ilya-village-sewer" },
        ],
      } as unknown as ITiledObject;

      jest
        // @ts-ignore
        .spyOn(characterNetworkUpdateMapManager.mapTransitionInfo, "getTransitionAtXY")
        .mockReturnValue(mockReturnValue);

      const sendMessageSpy = jest.spyOn(
        // @ts-ignore
        characterNetworkUpdateMapManager.socketMessaging,
        "sendErrorMessageToCharacter"
      );

      // Act
      await characterNetworkUpdateMapManager.handleMapTransition(testCharacter, 10, 20);

      // Assert
      if (testData.shouldAccess) {
        expect(sendMessageSpy).not.toHaveBeenCalled();
      } else {
        expect(sendMessageSpy).toHaveBeenCalledWith(
          testCharacter,
          expect.stringContaining("Sorry, a premium account of type")
        );
      }

      // Clean up
      sendMessageSpy.mockRestore();
    });
  });
});
