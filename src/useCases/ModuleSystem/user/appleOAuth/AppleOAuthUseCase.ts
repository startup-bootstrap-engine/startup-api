import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { AppleOAuthHelper, IAppleIdentityTokenResponse } from "@providers/auth/AppleOAuthHelper";
import { UserAuth } from "@providers/auth/UserAuth";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { IAuthResponse, IUser, UserAuthFlow } from "@startup-engine/shared";
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
    const validationPayload = await this.validateAppleToken(appleOAuthDTO);
    const dbUser = await this.findExistingUser(validationPayload.email);

    if (dbUser) {
      return this.handleExistingUser(dbUser);
    }
    return this.handleNewUser(appleOAuthDTO, validationPayload);
  }

  private async validateAppleToken(appleOAuthDTO: AppleOAuthDTO): Promise<IAppleIdentityTokenResponse> {
    const { identityToken, user } = appleOAuthDTO;
    const validationPayload = await this.appleOAuthHelper.verifyIdentityToken(identityToken);

    if (!validationPayload) {
      throw new BadRequestError("Failed to validate Apple identity token");
    }

    if (validationPayload.sub !== user || validationPayload.aud !== "com.blueship.mobile") {
      throw new BadRequestError("Apple SignIn: failed to validate user");
    }

    return validationPayload;
  }

  private async findExistingUser(email: string): Promise<IUser | null> {
    return await this.userRepository.findBy({
      authFlow: UserAuthFlow.AppleOAuth,
      email,
    });
  }

  private async handleNewUser(
    appleOAuthDTO: AppleOAuthDTO,
    validationPayload: IAppleIdentityTokenResponse
  ): Promise<IAuthResponse> {
    if (!appleOAuthDTO.email) {
      throw new BadRequestError(
        "User creation error: No e-mail was provided. Please try signing up by using the traditional Sign Up form."
      );
    }

    if (appleOAuthDTO.email !== validationPayload.email) {
      throw new BadRequestError("Email mismatch between provided data and Apple token");
    }

    const newUser = await this.userRepository.signUp({
      name: appleOAuthDTO.givenName || appleOAuthDTO.familyName || `AppleUser-${validationPayload.sub}`,
      email: appleOAuthDTO.email,
      authFlow: UserAuthFlow.AppleOAuth,
    } as unknown as IUser);

    await this.trackUserAnalytics(newUser);
    return this.userAuth.generateAccessToken(newUser);
  }

  private async handleExistingUser(user: IUser): Promise<IAuthResponse> {
    await this.trackUserAnalytics(user);
    return this.userAuth.generateAccessToken(user);
  }

  private async trackUserAnalytics(user: IUser): Promise<void> {
    await Promise.all([
      this.analyticsHelper.track("UserLogin", user),
      this.analyticsHelper.track("UserLoginApple", user),
      this.analyticsHelper.updateUserInfo(user),
    ]);
  }
}
