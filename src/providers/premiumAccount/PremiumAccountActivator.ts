import { IUser, User } from "@entities/ModuleSystem/UserModel";
import { UserAccountTypes } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(PremiumAccountActivator)
export class PremiumAccountActivator {
  public async isPremiumAccountActive(email: string): Promise<boolean> {
    const user = await User.findOne({ email: email }).lean().select("accountType");

    if (!user) {
      return false;
    }

    if (user.accountType === UserAccountTypes.Free) {
      return false;
    }

    return true;
  }

  public async activateUserPremiumAccount(
    user: IUser,
    accountType: UserAccountTypes,
    data?: Partial<IUser>
  ): Promise<void> {
    try {
      console.log("✨ Activating premium account for user", user.email, "with account type", accountType);

      await User.findByIdAndUpdate(user._id, {
        $set: {
          accountType: accountType,
          ...data,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  public async deactivateUserPremiumAccount(user: IUser): Promise<void> {
    try {
      console.log("😔 Deactivating premium account for user", user.email);

      await User.findByIdAndUpdate(user._id, {
        $set: {
          accountType: UserAccountTypes.Free,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
}
