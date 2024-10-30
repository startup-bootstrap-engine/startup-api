import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { AuthRefreshToken } from "@providers/auth/AuthRefreshToken";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { TS } from "@providers/translation/TranslationHelper";
import bcrypt from "bcrypt";
import { provide } from "inversify-binding-decorators";

import { UserAuth } from "@providers/auth/UserAuth";
import { IUser } from "@startup-engine/shared";
import { TransactionalEmail } from "../../../../../emails/TransactionalEmail";
import { appEnv } from "../../../../providers/config/env";
import { AuthChangePasswordDTO } from "../AuthDTO";

@provide(ChangePasswordUseCase)
export class ChangePasswordUseCase {
  constructor(
    private analyticsHelper: AnalyticsHelper,
    private userAuth: UserAuth,
    private transactionalEmail: TransactionalEmail,
    private authRefreshToken: AuthRefreshToken
  ) {}

  public async changePassword(user: IUser, authChangePasswordDTO: AuthChangePasswordDTO): Promise<void> {
    if (user.email === "playstore-testing@gmail.com") {
      throw new BadRequestError("You are not allowed to change the password for this user");
    }

    await this.analyticsHelper.track("ChangePassword", user);

    const { currentPassword: providedCurrentPassword, newPassword } = authChangePasswordDTO;

    // check if passwords are the same
    if (providedCurrentPassword === newPassword) {
      throw new BadRequestError(TS.translate("auth", "changePasswordSamePasswords"));
    }

    if (!providedCurrentPassword) {
      throw new BadRequestError("Current password is required");
    }

    if (!user.salt) {
      throw new BadRequestError("User salt is required");
    }

    const providedCurrentPasswordHash = await bcrypt.hash(providedCurrentPassword, user.salt);

    const isCurrentPasswordCorrect = providedCurrentPasswordHash === user.password;

    if (!isCurrentPasswordCorrect) {
      throw new BadRequestError(TS.translate("auth", "changePasswordIncorrectCurrentPassword"));
    }

    // Invalidate all refresh tokens when password is changed
    await this.authRefreshToken.invalidateAllRefreshTokens(user.id);

    // if currentPassword is correct, just change our current password to the new one provided.
    user.password = newPassword;

    await this.userAuth.recalculatePasswordHash(user);

    // Send confirmation to user
    await this.transactionalEmail.send(user.email, TS.translate("email", "passwordChangeTitle"), "notification", {
      notificationGreetings: TS.translate("email", "genericConfirmationTitle"),
      notificationMessage: TS.translate("email", "passwordChangeMessage", {
        adminEmail: appEnv.general.ADMIN_EMAIL!,
      }),
      notificationEndPhrase: TS.translate("email", "genericEndPhrase"),
    });
  }
}
