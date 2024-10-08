import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { IUser, UserAccountTypes } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(PremiumAccountActivator)
export class PremiumAccountActivator {
  constructor(private userRepository: UserRepository) {}

  @TrackNewRelicTransaction()
  public async isPremiumAccountActive(email: string): Promise<boolean> {
    const user = await this.userRepository.findBy({ email: email }, { select: "accountType" });

    if (!user) {
      return false;
    }

    if (user.accountType === UserAccountTypes.Free) {
      return false;
    }

    return true;
  }

  @TrackNewRelicTransaction()
  public async activateUserPremiumAccount(
    user: IUser,
    accountType: UserAccountTypes,
    data?: Partial<IUser>
  ): Promise<void> {
    try {
      console.log("✨ Activating premium account for user", user.email, "with account type", accountType);

      await this.userRepository.updateById(user._id, {
        accountType: accountType,
        ...data,
      });
    } catch (error) {
      console.error(error);
    }
  }

  public async deactivateUserPremiumAccount(user: IUser): Promise<boolean> {
    try {
      if (!user) {
        throw new Error("User not found");
      }

      console.log("😔 Deactivating premium account for user", user?.email);

      await this.userRepository.updateById(user._id, {
        accountType: UserAccountTypes.Free,
        isManuallyControlledPremiumAccount: false,
      });

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
