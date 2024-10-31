import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { AuthRefreshToken } from "@providers/auth/AuthRefreshToken";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { TS } from "@providers/translation/TranslationHelper";
import { IUser } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(LogoutUseCase)
export class LogoutUseCase {
  constructor(
    private analyticsHelper: AnalyticsHelper,
    private authRefreshToken: AuthRefreshToken
  ) {}

  public async logout(user: IUser): Promise<void> {
    if (!user) {
      throw new BadRequestError(TS.translate("auth", "userNotFound"));
    }

    await this.authRefreshToken.clearRefreshTokens(user);
    void this.analyticsHelper.track("UserLogout", user);
  }
}
