import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterUser } from "../CharacterUser";

describe("CharacterUser", () => {
  let characterUser: CharacterUser;
  let testCharacter: ICharacter;

  beforeAll(() => {
    characterUser = container.get(CharacterUser);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { isPremiumAccount: true });
  });

  it("properly fetches an user based on a character id", async () => {
    const user = await characterUser.findUserByCharacter(testCharacter._id);

    expect(user).toBeDefined();
  });
});
