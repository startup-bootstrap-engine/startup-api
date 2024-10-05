import { IUser, User } from "@entities/ModuleSystem/UserModel";
import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { BaseRepository, IBaseRepository } from "@providers/database/repository/BaseRepository";
import { RepositoryFactory } from "@providers/database/repository/RepositoryFactory";
import { provide } from "inversify-binding-decorators";

@provide(UserRepository)
export class UserRepository extends BaseRepository<IUser> implements IBaseRepository<IUser> {
  constructor(private analyticsHelper: AnalyticsHelper, private repositoryFactory: RepositoryFactory) {
    super(repositoryFactory.createRepository<IUser>(User));
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
