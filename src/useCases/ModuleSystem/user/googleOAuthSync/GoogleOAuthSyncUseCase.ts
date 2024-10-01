import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { UserAuth } from "@providers/auth/UserAuth";
import { TS } from "@providers/translation/TranslationHelper";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { IAuthResponse, IGoogleOAuthUserInfoResponse, UserAuthFlow } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";
import { InternalServerError } from "../../../../providers/errors/InternalServerError";

@provide(GoogleOAuthSyncUseCase)
export class GoogleOAuthSyncUseCase {
  constructor(
    private userRepository: UserRepository,
    private analyticsHelper: AnalyticsHelper,
    private userAuth: UserAuth
  ) {}

  public async googleOAuthSync(googleUserInfo: IGoogleOAuthUserInfoResponse): Promise<IAuthResponse> {
    if (!googleUserInfo.email) {
      throw new InternalServerError(TS.translate("auth", "oauthGoogleEmailNotProvided"));
    }

    const user = await this.userRepository.findBy({ email: googleUserInfo.email });

    if (!user) {
      //! create a new user and generate accessToken

      const newUser = await this.userRepository.signUp({
        name: googleUserInfo.name,
        email: googleUserInfo.email,
        authFlow: UserAuthFlow.GoogleOAuth,
      });

      await this.analyticsHelper.track("UserLogin", newUser);
      await this.analyticsHelper.track("UserLoginGoogle", newUser);
      await this.analyticsHelper.updateUserInfo(newUser);

      return await this.userAuth.generateAccessToken(newUser);
    } else {
      // Check if user already exists on database...
      // just create a new access token and refresh token and provide it

      await this.analyticsHelper.track("UserLogin", user);
      await this.analyticsHelper.track("UserLoginGoogle", user);
      await this.analyticsHelper.updateUserInfo(user);

      return await this.userAuth.generateAccessToken(user);
    }
  }
}
