import { IUser, User } from "@entities/ModuleSystem/UserModel";
import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { RepositoryFactory } from "@providers/database/repository/RepositoryFactory";
import { NotFoundError } from "@providers/errors/NotFoundError";
import { TS } from "@providers/translation/TranslationHelper";
import { provide } from "inversify-binding-decorators";

import { BaseRepository } from "@providers/database/repository/BaseRepository";

export interface IUserRepository {
  findUser(params: object): Promise<IUser>;
  signUp(newUserData): Promise<IUser>;
}

@provide(UserRepository)
export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor(private analyticsHelper: AnalyticsHelper, private repositoryFactory: RepositoryFactory) {
    super(repositoryFactory.createRepository<IUser>(User));
  }

  public async signUp(newUserData: any): Promise<IUser> {
    const newUser = await this.create(newUserData, "email");

    void this.analyticsHelper.track("UserRegister", newUser);
    void this.analyticsHelper.updateUserInfo(newUser);

    return newUser;
  }

  public async findUser(params: object): Promise<IUser> {
    const user = await this.findBy(params);

    if (!user) {
      throw new NotFoundError(TS.translate("users", "userNotFound"));
    }

    return user;
  }
}
