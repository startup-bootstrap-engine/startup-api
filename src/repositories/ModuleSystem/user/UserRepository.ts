import { UserModel } from "@entities/ModuleSystem/UserModel";
import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { BaseRepository, IBaseRepository } from "@providers/database/repository/BaseRepository";
import { RepositoryFactory } from "@providers/database/repository/RepositoryFactory";
import { IUser, userSchema } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(UserRepository)
export class UserRepository extends BaseRepository<IUser> implements IBaseRepository<IUser> {
  constructor(
    private analyticsHelper: AnalyticsHelper,
    private repositoryFactory: RepositoryFactory,
    private userModel: UserModel
  ) {
    // Initialize the base repository after ensuring userSchema is available
    super(repositoryFactory.createRepository<IUser>(userModel.initializeData(userSchema), userSchema));
  }

  public async signUp(newUserData: IUser): Promise<IUser> {
    const newUser = await this.create(newUserData, {
      uniqueByKeys: "email",
    });

    void this.analyticsHelper.track("UserRegister", newUser);
    void this.analyticsHelper.updateUserInfo(newUser);

    return newUser;
  }
}
