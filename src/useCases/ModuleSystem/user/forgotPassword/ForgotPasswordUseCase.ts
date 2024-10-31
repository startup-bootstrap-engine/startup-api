import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { UserAuth } from "@providers/auth/UserAuth";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { NotFoundError } from "@providers/errors/NotFoundError";
import { TS } from "@providers/translation/TranslationHelper";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { UserAuthFlow } from "@startup-engine/shared";
import randomString from "crypto-random-string";
import { provide } from "inversify-binding-decorators";
import { TransactionalEmail } from "../../../../../emails/TransactionalEmail";
import { appEnv } from "../../../../providers/config/env";

@provide(ForgotPasswordUseCase)
export class ForgotPasswordUseCase {
  constructor(
    private analyticsHelper: AnalyticsHelper,
    private userAuth: UserAuth,
    private userRepository: UserRepository,
    private transactionalEmail: TransactionalEmail
  ) {}

  public async forgotPassword(email: string): Promise<boolean> {
    try {
      if (email === "playstore-testing@gmail.com") {
        throw new BadRequestError("You are not allowed to reset the password for this user");
      }
      // Try to get user with the mentioned email
      const user = await this.userRepository.findBy({ email });
      if (!user) {
        throw new NotFoundError(TS.translate("users", "userNotFound"));
      }

      void this.analyticsHelper.track("ForgotPassword", user);

      if (user.authFlow !== UserAuthFlow.Basic) {
        throw new Error(TS.translate("auth", "authModeError"));
      }

      // Generate a new password
      const randomPassword = randomString({ length: 10 });

      console.log(`New password for user ${user.email}: ${randomPassword}`);

      // Update user's password
      const updatedUser = await this.userRepository.updateById(user.id, { password: randomPassword });

      if (!updatedUser) {
        throw new Error(TS.translate("users", "userNotFound"));
      }

      await this.userAuth.recalculatePasswordHash(updatedUser);

      // Send email to user with the new password content
      await this.transactionalEmail.send(
        user.email,
        TS.translate("email", "passwordRecoveryGreetings"),
        "notification",
        {
          notificationGreetings: TS.translate("email", "passwordRecoveryGreetings"),
          notificationMessage: TS.translate(
            "email",
            "passwordRecoveryMessage",
            {
              randomPassword,
            },
            false
          ),
          notificationEndPhrase: TS.translate("email", "passwordRecoveryEndPhrase"),
          adminEmail: appEnv.general.ADMIN_EMAIL,
        }
      );

      return true;
    } catch (error) {
      console.error(error);
      throw error; // Re-throw the original error
    }
  }
}
