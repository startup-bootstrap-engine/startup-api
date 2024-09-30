/* eslint-disable mongoose-lean/require-lean */

import { IUser, User } from "@entities/ModuleSystem/UserModel";

import { mapLoader } from "@providers/inversify/container";

import { provide } from "inversify-binding-decorators";
import { userMock } from "./mock/userMock";

export enum InteractionQuestSubtype {
  craft = "craft",
}

@provide(UnitTestHelper)
export class UnitTestHelper {
  private readonly oneMinuteAgo = 60 * 1000;

  public async initializeMapLoader(): Promise<void> {
    jest
      // @ts-ignore
      .spyOn(mapLoader, "getMapNames")
      // @ts-ignore
      .mockImplementation(() => ["unit-test-map.json", "example.json", "unit-test-map-negative-coordinate.json"]);

    await mapLoader.init();
  }

  public async createMockUser(extraProps?: Partial<IUser>): Promise<IUser> {
    const newUser = new User({
      ...userMock,
      ...extraProps,
    });

    await newUser.save();

    return newUser;
  }
}
