import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterPremiumAccount } from "../CharacterPremiumAccount";

describe("CharacterPremiumAccount", () => {
  let characterPremiumAccount: CharacterPremiumAccount;
  let testCharacter: ICharacter;

  beforeAll(() => {
    characterPremiumAccount = container.get(CharacterPremiumAccount);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { isPremiumAccount: true });
  });

  it("properly checks if a character is a premium account", async () => {
    const isPremium = await characterPremiumAccount.isPremiumAccount(testCharacter._id);

    expect(isPremium).toBe(true);
  });
});
