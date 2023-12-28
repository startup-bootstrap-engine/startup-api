import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(PremiumAccountCrons)
export class PremiumAccountCrons {
  constructor(private cronJobScheduler: CronJobScheduler) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("premium-account-cron-activate", "0 */15 * * *", async () => {
      await this.activatePremiumAccounts();
    });

    this.cronJobScheduler.uniqueSchedule("premium-account-cron-deactivate", "0 */12 * * *", async () => {
      await this.deactivatePremiumAccounts();
    });
  }

  private async activatePremiumAccounts(): Promise<void> {}

  private async deactivatePremiumAccounts(): Promise<void> {}
}
