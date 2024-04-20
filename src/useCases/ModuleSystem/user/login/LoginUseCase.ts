import { User } from "@entities/ModuleSystem/UserModel";
import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { NotFoundError } from "@providers/errors/NotFoundError";
import { TS } from "@providers/translation/TranslationHelper";
import { IAuthResponse } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { AuthLoginDTO } from "../AuthDTO";
import { validate } from "email-validator";

@provide(LoginUseCase)
export class LoginUseCase {
  constructor(private analyticsHelper: AnalyticsHelper) {}

  public async login(authLoginDTO: AuthLoginDTO): Promise<IAuthResponse> {
    const email = authLoginDTO.email.trim().toLowerCase();
    const { password } = authLoginDTO;

    // try to find an user using these credentials
    const user = await User.findByCredentials(email, password);

    if (!user) {
      throw new NotFoundError(TS.translate("auth", "invalidCredentials"));
    }

    if (!validate(email)) {
      throw new BadRequestError("Sorry, your e-mail is invalid");
    }

    const { accessToken, refreshToken } = await user.generateAccessToken();

    await this.analyticsHelper.updateUserInfo(user);

    await this.analyticsHelper.track("UserLogin", user);

    return {
      accessToken,
      refreshToken,
    };
  }
}
