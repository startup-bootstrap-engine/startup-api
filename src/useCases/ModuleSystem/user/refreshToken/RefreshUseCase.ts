import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { TS } from "@providers/translation/TranslationHelper";
import { provide } from "inversify-binding-decorators";
import jwt from "jsonwebtoken";

import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { IUser } from "@startup-engine/shared";
import { appEnv } from "../../../../providers/config/env";
import { ForbiddenError } from "../../../../providers/errors/ForbiddenError";
import { UnauthorizedError } from "../../../../providers/errors/UnauthorizedError";

@provide(RefreshUseCase)
export class RefreshUseCase {
  constructor(
    private analyticsHelper: AnalyticsHelper,
    private userRepository: UserRepository
  ) {}

  /**
   * Generates a new accessToken based on a previous refreshToken
   * @param user
   * @param refreshToken
   */
  public async refreshToken(user: IUser, refreshToken: string): Promise<string | false> {
    if (user) {
      await this.analyticsHelper.track("UserTokenRefresh", user);
    }

    if (!refreshToken) {
      throw new UnauthorizedError(TS.translate("auth", "notAllowedResource"));
    }

    if (!user.refreshTokens) {
      throw new BadRequestError(TS.translate("auth", "dontHaveRefreshTokens"));
    }

    // @ts-ignore
    if (!user.refreshTokens.find((item) => item.token === refreshToken)) {
      throw new BadRequestError(TS.translate("auth", "refreshTokenInvalid"));
    }

    try {
      // Verify the refresh token
      jwt.verify(refreshToken, appEnv.authentication.REFRESH_TOKEN_SECRET!);

      // Generate new access token with unique jti (JWT ID) to ensure uniqueness
      const accessToken = jwt.sign(
        {
          _id: user.id,
          email: user.email,
          jti: Math.random().toString(36).substring(2),
        },
        appEnv.authentication.JWT_SECRET!
        // { expiresIn: "20m" }
      );

      return accessToken;
    } catch (err) {
      throw new ForbiddenError(TS.translate("auth", "refreshTokenInvalid"));
    }
  }
}
