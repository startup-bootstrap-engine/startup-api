import { IUser } from "@entities/ModuleSystem/schemas/userSchema";
import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { TS } from "@providers/translation/TranslationHelper";
import { provide } from "inversify-binding-decorators";

@provide(OwnInfoUserUseCase)
export class OwnInfoUserUseCase {
  constructor(private analyticsHelper: AnalyticsHelper) {}

  public getUserInfo(user: IUser): IUser {
    if (!user) {
      throw new BadRequestError(TS.translate("users", "userNotFound"));
    }

    void this.analyticsHelper.updateUserInfo(user);

    void this.analyticsHelper.track("UserInfo", user);

    return user;
  }
}
