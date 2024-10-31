import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { IUser, UserTypes } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";
import { userMock } from "./mock/userMock";

@provide(E2ETestMocker)
export class E2ETestMocker {
  constructor(private userRepository: UserRepository) {}

  public async createMockUser(extraProps?: Partial<IUser>): Promise<IUser> {
    const newUser = await this.userRepository.create({
      ...(userMock as unknown as IUser),
      ...extraProps,
    });

    return newUser;
  }

  public async createMockAdminUser(extraProps?: Partial<IUser>): Promise<IUser> {
    return await this.createMockUser({
      ...extraProps,
      role: UserTypes.Admin,
    });
  }
}
