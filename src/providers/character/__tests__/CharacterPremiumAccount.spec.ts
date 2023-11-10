import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IUser } from "@entities/ModuleSystem/UserModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterPremiumAccount } from "../CharacterPremiumAccount";

describe("CharacterPremiumAccount", () => {
  let characterPremiumAccount: CharacterPremiumAccount;
  let testCharacter: ICharacter;
  let testUser: IUser;

  beforeAll(() => {
    characterPremiumAccount = container.get(CharacterPremiumAccount);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();
    testUser = await unitTestHelper.createMockUser({
      characters: [testCharacter._id],
      isPremiumAccount: true,
    });
  });

  it("properly checks if a character is a premium account", async () => {
    const isPremium = await characterPremiumAccount.isPremiumAccount(testCharacter);

    expect(isPremium).toBe(true);
  });
});
