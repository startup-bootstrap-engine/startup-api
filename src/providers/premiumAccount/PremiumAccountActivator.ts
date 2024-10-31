import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import * as shared from "@startup-engine/shared";
import { IUser, UserAccountTypes } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(PremiumAccountActivator)
export class PremiumAccountActivator {
  constructor(private userRepository: UserRepository) {}

  @TrackNewRelicTransaction()
  public async isPremiumAccountActive(email: string): Promise<boolean> {
    const user = await this.userRepository.findBy({ email }, { select: "accountType" });

    if (!user) {
      return false;
    }

    if (user.accountType === shared.UserAccountTypes.Free) {
      return false;
    }

    return true;
  }

  @TrackNewRelicTransaction()
  public async activateUserPremiumAccount(
    user: IUser,
    accountType: UserAccountTypes,
    data?: Partial<IUser>
  ): Promise<boolean> {
    try {
      console.log("✨ Activating premium account for user", user.email, "with account type", accountType);

      await this.userRepository.updateById(user.id, {
        accountType,
        ...data,
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async deactivateUserPremiumAccount(user: shared.IUser): Promise<boolean> {
    try {
      if (!user) {
        throw new Error("User not found");
      }

      console.log("😔 Deactivating premium account for user", user?.email);

      await this.userRepository.updateById(user.id, {
        accountType: shared.UserAccountTypes.Free,
        isManuallyControlledPremiumAccount: false,
      });

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
