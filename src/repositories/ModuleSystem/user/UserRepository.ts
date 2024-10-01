import { IUser, User } from "@entities/ModuleSystem/UserModel";
import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { RepositoryFactory } from "@providers/database/repository/RepositoryFactory";
import { provide } from "inversify-binding-decorators";

import { BaseRepository } from "@providers/database/repository/BaseRepository";

export interface IUserRepository {
  signUp(newUserData): Promise<IUser>;
}

@provide(UserRepository)
export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor(private analyticsHelper: AnalyticsHelper) {
    super(RepositoryFactory.createRepository<IUser>(User));
  }

  public async signUp(newUserData: any): Promise<IUser> {
    const newUser = await this.create(newUserData, {
      uniqueByKeys: "email",
    });

    void this.analyticsHelper.track("UserRegister", newUser);
    void this.analyticsHelper.updateUserInfo(newUser);

    return newUser;
  }
}
