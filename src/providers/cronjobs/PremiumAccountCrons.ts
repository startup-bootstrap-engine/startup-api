import { IUser, User } from "@entities/ModuleSystem/UserModel";
import { PatreonAPI } from "@providers/patreon/PatreonAPI";
import { PremiumAccountActivator } from "@providers/premiumAccount/PremiumAccountActivator";
import { UserAccountTypes } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(PremiumAccountCrons)
export class PremiumAccountCrons {
  constructor(
    private cronJobScheduler: CronJobScheduler,
    private patreonAPI: PatreonAPI,
    private premiumAccountActivator: PremiumAccountActivator
  ) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("premium-account-cron-activate", "0 */15 * * *", async () => {
      await this.activatePremiumAccounts();
    });

    // this.cronJobScheduler.uniqueSchedule("premium-account-cron-deactivate", "0 */12 * * *", async () => {
    this.cronJobScheduler.uniqueSchedule("premium-account-cron-deactivate", "* * * * *", async () => {
      await this.deactivatePremiumAccounts();
    });
  }

  private async activatePremiumAccounts(): Promise<void> {
    console.log("Activating premium accounts...");
    // fetch all active patreons
    const activePatreons = await this.patreonAPI.getPatreons("active_patron", "all");

    if (!activePatreons) {
      throw new Error("Failed to fetch active patreons");
    }

    // Fetch emails of all active Patreons
    const activePatreonEmails = activePatreons.map((patreon) => patreon.attributes.email);

    // Fetch users with those emails
    const users = (await User.find({ email: { $in: activePatreonEmails } })
      .lean()
      .select("_id email accountType")) as IUser[];

    const usersByEmail = new Map(users.map((user) => [user.email, user]));

    for (const activePatreon of activePatreons) {
      try {
        // Find the corresponding user from the map
        const user = usersByEmail.get(activePatreon.attributes.email);

        if (!user) {
          console.error(
            `Patreon Activation: Failed to find user with email ${activePatreon.attributes.email}. Probably the user created the account with a different email than what's registered in our system.`
          );
          continue;
        }

        if (!activePatreon.attributes.tier_name) {
          console.error(
            `Patreon Activation: Failed to find tier_name for user with email ${activePatreon.attributes.email}.`
          );
          continue;
        }

        // Validate tier_name before casting
        if (!Object.values(UserAccountTypes).includes(activePatreon.attributes.tier_name as UserAccountTypes)) {
          console.error(
            `Patreon Activation: Invalid tier_name ${activePatreon.attributes.tier_name} for user with email ${activePatreon.attributes.email}.`
          );
          continue;
        }

        // check if user already has a premium account with the same tier
        if (user.accountType === activePatreon.attributes.tier_name) {
          console.log(
            `Patreon Activation: User ${user.email} already has a premium account with the same tier ${activePatreon.attributes.tier_name}. Skipping...`
          );
          continue;
        }

        // activate the premium account if not active in our system yet
        await this.premiumAccountActivator.activateUserPremiumAccount(
          user,
          activePatreon.attributes.tier_name as UserAccountTypes
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  private async deactivatePremiumAccounts(): Promise<void> {
    try {
      // Fetch all users with active premium accounts
      const premiumUsers = (await User.find({ accountType: { $ne: UserAccountTypes.Free, $exists: true } })
        .lean()
        .select("_id email accountType")) as IUser[];

      // Fetch all active Patreons
      const activePatreons = await this.patreonAPI.getPatreons("active_patron", "all");
      const activePatreonEmails = activePatreons?.map((patreon) => patreon.attributes.email);

      for (const user of premiumUsers) {
        if (user.isManuallyControlledPremiumAccount) {
          console.log(
            `Patreon Deactivation: User ${user.email} has a manually controlled premium account. Skipping...`
          );
          continue;
        }

        // If the user is not an active Patreon, deactivate their premium account
        if (!activePatreonEmails?.includes(user.email)) {
          // check if its already inactive
          if (user.accountType === UserAccountTypes.Free) {
            console.log(`Patreon Deactivation: User ${user.email} already has a free account. Skipping...`);
            continue;
          }

          await this.premiumAccountActivator.deactivateUserPremiumAccount(user);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
