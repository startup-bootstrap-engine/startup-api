/* eslint-disable mongoose-performance/require-lean */

import { IUser } from "@entities/ModuleSystem/UserModel";

import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { provide } from "inversify-binding-decorators";
import { userMock } from "./mock/userMock";

export enum InteractionQuestSubtype {
  craft = "craft",
}

@provide(UnitTestHelper)
export class UnitTestHelper {
  constructor(private userRepository: UserRepository) {}

  public async createMockUser(extraProps?: Partial<IUser>): Promise<IUser> {
    const newUser = await this.userRepository.create({
      ...(userMock as unknown as IUser),
      ...extraProps,
    });

    return newUser;
  }
}
