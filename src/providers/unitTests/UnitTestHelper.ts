/* eslint-disable mongoose-lean/require-lean */

import { IUser, User } from "@entities/ModuleSystem/UserModel";

import { provide } from "inversify-binding-decorators";
import { userMock } from "./mock/userMock";

export enum InteractionQuestSubtype {
  craft = "craft",
}

@provide(UnitTestHelper)
export class UnitTestHelper {
  private readonly oneMinuteAgo = 60 * 1000;

  public async createMockUser(extraProps?: Partial<IUser>): Promise<IUser> {
    const newUser = new User({
      ...userMock,
      ...extraProps,
    });

    await newUser.save();

    return newUser;
  }
}
