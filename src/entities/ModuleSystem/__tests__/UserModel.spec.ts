import { integrationTestMocker } from "@providers/inversify/container";
import { IUser, UserAuthFlow, UserTypes } from "@startup-engine/shared";
describe("UserModel.ts", () => {
  let testUser: IUser;

  beforeEach(async () => {
    testUser = await integrationTestMocker.createMockUser();
  });

  it("Validate if the record is being created", () => {
    const user = {
      id: testUser.id,
      name: "User Mock Test",
      role: UserTypes.Regular,
      authFlow: UserAuthFlow.Basic,
      email: "user-mock@test.com",
      address: "mock street",
      phone: "12355679895",
      unsubscribed: false,
      isLoggedIn: true,
      token: "asdad",
      wallet: {
        publicAddress: "public address",
        networkId: 1234,
      },
      characters: [],
    };

    expect(user).toBeDefined();

    expect(user.id).toEqual(testUser.id);
    expect(user.name).toEqual(testUser.name);
    expect(user.role).toEqual(testUser.role);
    expect(user.authFlow).toEqual(testUser.authFlow);
    expect(user.email).toEqual(testUser.email);
    expect(user.address).toEqual(testUser.address);
    expect(user.phone).toEqual(testUser.phone);
  });
});
