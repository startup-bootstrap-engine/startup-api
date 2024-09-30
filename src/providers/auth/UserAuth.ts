import { IUser, User } from "@entities/ModuleSystem/UserModel";
import { appEnv } from "@providers/config/env";
import { InternalServerError } from "@providers/errors/InternalServerError";
import { NotFoundError } from "@providers/errors/NotFoundError";
import { TS } from "@providers/translation/TranslationHelper";
import { UserAuthFlow } from "@startup-engine/shared";
import bcrypt from "bcrypt";
import { provide } from "inversify-binding-decorators";
import jwt from "jsonwebtoken";

@provide(UserAuth)
export class UserAuth {
  public async isValidPassword(providedPassword: string, user: IUser): Promise<boolean> {
    const comparisonHash = await bcrypt.hash(providedPassword, user.salt!);

    return comparisonHash === user.password;
  }

  public async generateAccessToken(user: IUser): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = jwt.sign(
      { _id: user._id, email: user.email },
      appEnv.authentication.JWT_SECRET!
      // { expiresIn: "20m" }
    );
    const refreshToken = jwt.sign({ _id: user._id, email: user.email }, appEnv.authentication.REFRESH_TOKEN_SECRET!);

    await User.updateOne({ _id: user._id }, { $push: { refreshTokens: { token: refreshToken } } });

    return {
      accessToken,
      refreshToken,
    };
  }

  public async checkIfExists(email: string): Promise<boolean> {
    const exists = await User.exists({ email: email.toLocaleLowerCase() });

    if (exists) {
      return true;
    }

    return false;
  }

  public async findByCredentials(email: string, password: string): Promise<IUser | null> {
    const user = await User.findOne({ email: email.toLocaleLowerCase() }).lean<IUser>();

    if (!user) {
      throw new NotFoundError(TS.translate("users", "userNotFound"));
    }

    // check if user was created using Basic UserAuthFlow (this route is only for this!)

    if (user.authFlow !== UserAuthFlow.Basic) {
      throw new InternalServerError(TS.translate("auth", "authModeError"));
    }

    const isValidPassword = await this.isValidPassword(password, user);

    if (isValidPassword) {
      return user;
    }

    return null;
  }

  public async recalculatePasswordHash(user: IUser): Promise<void> {
    const email = user.email.toLocaleLowerCase();
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(user.password, salt);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          email: email,
          password: hash,
          salt: salt,
        },
      }
    );
  }
}
