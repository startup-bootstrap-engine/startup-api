import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { IUser } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";
import jwt from "jsonwebtoken";
import { appEnv } from "../config/env";
import { InternalServerError } from "../errors/InternalServerError";
import { NotFoundError } from "../errors/NotFoundError";
import { TS } from "../translation/TranslationHelper";

@provide(AuthRefreshToken)
export class AuthRefreshToken {
  constructor(private userRepository: UserRepository) {}

  public async addRefreshToken(user: IUser, refreshToken: string): Promise<void> {
    const currentTokens = user.refreshTokens ?? [];

    await this.userRepository.updateById(user.id, {
      refreshTokens: [...currentTokens, { token: refreshToken }],
    });
  }

  public async removeRefreshToken(user: IUser, refreshToken: string): Promise<void> {
    const updatedRefreshTokens = user.refreshTokens?.filter((t: any) => t.token !== refreshToken) ?? [];
    await this.userRepository.updateById(user.id, { refreshTokens: updatedRefreshTokens });
  }

  public async invalidateAllRefreshTokens(userId: string): Promise<void> {
    await this.userRepository.updateById(userId, { refreshTokens: [] });
  }

  public async verifyRefreshToken(refreshToken: string): Promise<IUser> {
    try {
      const payload = jwt.verify(refreshToken, appEnv.authentication.REFRESH_TOKEN_SECRET!) as any;
      const user = await this.userRepository.findById(payload.id);

      if (!user) {
        throw new NotFoundError(TS.translate("users", "userNotFound"));
      }

      const hasValidToken = user.refreshTokens?.some((t: any) => t.token === refreshToken);
      if (!hasValidToken) {
        throw new InternalServerError("Invalid refresh token");
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError("Invalid refresh token");
    }
  }

  public generateRefreshToken(user: IUser): string {
    return jwt.sign({ id: user.id, email: user.email }, appEnv.authentication.REFRESH_TOKEN_SECRET!);
  }
}
