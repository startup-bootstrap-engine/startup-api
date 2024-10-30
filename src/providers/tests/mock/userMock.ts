import { IUser, UserAuthFlow, UserTypes } from "@startup-engine/shared";

export const userMock: Partial<IUser> = {
  name: "User Mock Test",
  role: UserTypes.Regular,
  authFlow: UserAuthFlow.Basic,
  email: "user-mock@test.com",
  address: "mock street",
  phone: "12355679895",
  unsubscribed: false,
};
