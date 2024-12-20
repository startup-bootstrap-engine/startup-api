import { appEnv } from "@providers/config/env";
import { InternalServerError } from "@providers/errors/InternalServerError";
import { NotFoundError } from "@providers/errors/NotFoundError";
import { TS } from "@providers/translation/TranslationHelper";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { EnvType, IUser, UserAuthFlow } from "@startup-engine/shared";
import bcrypt from "bcrypt";
import { provide } from "inversify-binding-decorators";
import jwt from "jsonwebtoken";
import { AuthRefreshToken } from "./AuthRefreshToken";

export interface IGenerateAccessTokenResponse {
  accessToken: string;
  refreshToken: string;
}

@provide(UserAuth)
export class UserAuth {
  constructor(
    private userRepository: UserRepository,
    private authRefreshToken: AuthRefreshToken
  ) {}

  public async isValidPassword(providedPassword: string, user: IUser): Promise<boolean> {
    if (!user.password) {
      throw new InternalServerError("User password not found");
    }

    return await bcrypt.compare(providedPassword, user.password);
  }

  public async generateAccessToken(user: IUser): Promise<IGenerateAccessTokenResponse> {
    if (!user) {
      throw new InternalServerError("User not found");
    }

    if (!appEnv.authentication.JWT_SECRET) {
      throw new InternalServerError("JWT_SECRET is not set");
    }

    const payload = { _id: user.id, email: user.email };

    const expiresIn =
      appEnv.general.ENV === EnvType.Development
        ? "24h" // 24 hours for development
        : "20m"; // 20 minutes for production

    const accessToken = jwt.sign(payload, appEnv.authentication.JWT_SECRET!, {
      algorithm: "HS256",
      expiresIn,
    });

    const refreshToken = this.authRefreshToken.generateRefreshToken(user);
    await this.authRefreshToken.addRefreshToken(user, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  public async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.authRefreshToken.verifyRefreshToken(refreshToken);

    // Generate new tokens
    const newTokens = await this.generateAccessToken(user);

    // Remove old refresh token
    await this.authRefreshToken.removeRefreshToken(user, refreshToken);

    return newTokens;
  }

  public async checkIfExists(email: string): Promise<boolean> {
    const exists = await this.userRepository.exists({ email: email.toLocaleLowerCase() });
    return !!exists;
  }

  public async findByCredentials(email: string, password: string): Promise<IUser | null> {
    const user = await this.userRepository.findBy({ email: email.toLocaleLowerCase() });

    if (!user) {
      throw new NotFoundError(TS.translate("users", "userNotFound"));
    }

    if (user.authFlow !== UserAuthFlow.Basic) {
      throw new InternalServerError(TS.translate("auth", "authModeError"));
    }

    const isValidPassword = await this.isValidPassword(password, user);

    return isValidPassword ? user : null;
  }

  public async recalculatePasswordHash(user: IUser): Promise<void> {
    const email = user.email?.toLocaleLowerCase();

    if (!email) {
      throw new InternalServerError("User email not found");
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(user.password!, salt);

    await this.userRepository.updateById(user.id, {
      email,
      password: hash,
      salt,
    });
  }
}
