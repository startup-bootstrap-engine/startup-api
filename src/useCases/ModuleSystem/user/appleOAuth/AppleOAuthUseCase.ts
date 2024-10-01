import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { AppleOAuthHelper } from "@providers/auth/AppleOAuthHelper";
import { UserAuth } from "@providers/auth/UserAuth";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { IAuthResponse, UserAuthFlow } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";
import { AppleOAuthDTO } from "../AuthDTO";

@provide(AppleOAuthUseCase)
export class AppleOAuthUseCase {
  constructor(
    private userRepository: UserRepository,
    private analyticsHelper: AnalyticsHelper,
    private appleOAuthHelper: AppleOAuthHelper,
    private userAuth: UserAuth
  ) {}

  public async appleOAuthSync(appleOAuthDTO: AppleOAuthDTO): Promise<IAuthResponse> {
    const { identityToken, user } = appleOAuthDTO;

    const validationPayload = await this.appleOAuthHelper.verifyIdentityToken(identityToken);

    if (!validationPayload) {
      throw new BadRequestError("Failed to validate Apple identity token");
    }

    // this verifies if the user is the same from our identity token and if the package name is correct
    if (validationPayload.sub !== user || validationPayload.aud !== "com.blueship.mobile") {
      throw new BadRequestError("Apple SignIn: failed to validate user");
    }

    // eslint-disable-next-line mongoose-performance/require-lean
    const dbUser = await this.userRepository.findByQueryParams({
      authFlow: UserAuthFlow.AppleOAuth,
      email: validationPayload.email,
    });

    if (!dbUser) {
      if (!appleOAuthDTO.email) {
        throw new BadRequestError(
          "User creation error: No e-mail was provided. Please try signing up by using the traditional Sign Up form."
        );
      }

      const newUser = await this.userRepository.signUp({
        name: appleOAuthDTO.givenName,
        email: appleOAuthDTO.email,
        authFlow: UserAuthFlow.AppleOAuth,
      });

      await this.analyticsHelper.track("UserLogin", newUser);
      await this.analyticsHelper.track("UserLoginApple", newUser);
      await this.analyticsHelper.updateUserInfo(newUser);

      return await this.userAuth.generateAccessToken(newUser);
    } else {
      // Check if user already exists on database...
      // just create a new access token and refresh token and provide it

      await this.analyticsHelper.track("UserLogin", dbUser);
      await this.analyticsHelper.track("UserLoginApple", dbUser);
      await this.analyticsHelper.updateUserInfo(dbUser);

      return await this.userAuth.generateAccessToken(dbUser);
    }
  }
}
