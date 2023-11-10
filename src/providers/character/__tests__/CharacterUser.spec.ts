import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IUser } from "@entities/ModuleSystem/UserModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterUser } from "../CharacterUser";

describe("CharacterUser", () => {
  let characterUser: CharacterUser;
  let testCharacter: ICharacter;
  let testUser: IUser;

  beforeAll(() => {
    characterUser = container.get(CharacterUser);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();

    testUser = await unitTestHelper.createMockUser({
      characters: [testCharacter._id],
    });
  });

  it("properly fetches an user based on a character id", async () => {
    const user = await characterUser.findUserByCharacter(testCharacter);

    expect(user).toBeDefined();
  });
});
