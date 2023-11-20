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
    const premiumAccountData = await characterPremiumAccount.getPremiumAccountData(testCharacter);

    expect(premiumAccountData).not.toBeUndefined();
  });

  it("properly gets the premium account type", async () => {
    const premiumType = await characterPremiumAccount.getPremiumAccountType(testCharacter);

    expect(premiumType).not.toBeUndefined();
  });
});
