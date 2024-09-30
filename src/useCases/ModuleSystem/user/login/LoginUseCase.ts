import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { UserAuth } from "@providers/auth/UserAuth";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { NotFoundError } from "@providers/errors/NotFoundError";
import { TS } from "@providers/translation/TranslationHelper";
import { IAuthResponse } from "@startup-engine/shared";
import { validate } from "email-validator";
import { provide } from "inversify-binding-decorators";
import { AuthLoginDTO } from "../AuthDTO";

@provide(LoginUseCase)
export class LoginUseCase {
  constructor(private analyticsHelper: AnalyticsHelper, private userAuth: UserAuth) {}

  public async login(authLoginDTO: AuthLoginDTO): Promise<IAuthResponse> {
    const email = authLoginDTO.email.trim().toLowerCase();
    const { password } = authLoginDTO;

    // try to find an user using these credentials
    const user = await this.userAuth.findByCredentials(email, password);

    if (!user) {
      throw new NotFoundError(TS.translate("auth", "invalidCredentials"));
    }

    if (!validate(email)) {
      throw new BadRequestError("Sorry, your e-mail is invalid");
    }

    const { accessToken, refreshToken } = await this.userAuth.generateAccessToken(user);

    void this.analyticsHelper.updateUserInfo(user);

    void this.analyticsHelper.track("UserLogin", user);

    return {
      accessToken,
      refreshToken,
    };
  }
}
