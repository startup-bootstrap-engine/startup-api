/* eslint-disable mongoose-performance/require-lean */

import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { IUser } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";
import { userMock } from "./mock/userMock";

export enum InteractionQuestSubtype {
  craft = "craft",
}

@provide(IntegrationTestMocker)
export class IntegrationTestMocker {
  constructor(private userRepository: UserRepository) {}

  public async createMockUser(extraProps?: Partial<IUser>): Promise<IUser> {
    const newUser = await this.userRepository.create({
      ...(userMock as unknown as IUser),
      ...extraProps,
    });

    return newUser;
  }
}
