import { IUser, User } from "@entities/ModuleSystem/UserModel";
import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { NotFoundError } from "@providers/errors/NotFoundError";
import { CRUD } from "@providers/mongoDB/MongoCRUDGeneric";
import { TS } from "@providers/translation/TranslationHelper";
import { provide } from "inversify-binding-decorators";

import { IUserRepository } from "./IUserRepository";

@provide(UserRepository)
export class UserRepository extends CRUD implements IUserRepository {
  constructor(private analyticsHelper: AnalyticsHelper) {
    super(analyticsHelper);
  }

  public async signUp(newUserData: any): Promise<IUser> {
    //! Note: password is hashed on pre("save") method from userSchema
    const newUser = new User({ ...newUserData });

    // eslint-disable-next-line mongoose-lean/require-lean
    await newUser.save();

    void this.analyticsHelper.track("UserRegister", newUser);

    void this.analyticsHelper.updateUserInfo(newUser);

    return newUser;
  }

  public async findUser(params: object): Promise<IUser> {
    // eslint-disable-next-line mongoose-lean/require-lean
    const user = await User.findOne(params).lean<IUser>();

    if (!user) {
      throw new NotFoundError(TS.translate("users", "userNotFound"));
    }

    return user;
  }
}
