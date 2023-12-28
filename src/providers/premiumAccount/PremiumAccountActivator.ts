import { IUser, User } from "@entities/ModuleSystem/UserModel";
import { UserAccountTypes } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(PremiumAccountActivator)
export class PremiumAccountActivator {
  public async activateUserPremiumAccount(
    user: IUser,
    accountType: UserAccountTypes,
    expirationDate?: Date
  ): Promise<void> {
    try {
      await User.findByIdAndUpdate(user._id, {
        $set: {
          accountType: accountType,
          premiumAccountExpirationDate: expirationDate,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
}
