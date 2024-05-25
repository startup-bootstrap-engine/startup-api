import { DynamicXPActivator } from "@providers/dynamic-xp-ratio/DynamicXPActivator";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(BonusXpEventCrons)
export class BonusXpEventCrons {
  constructor(private cronJobScheduler: CronJobScheduler, private dynamicXPActivator: DynamicXPActivator) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("weekend-xp-event-crons-check", "*/30 * * * *", async () => {
      await this.checkAndUpdateXpRatio();
    });
  }

  private async checkAndUpdateXpRatio(): Promise<void> {
    await this.dynamicXPActivator.toggleXpRatio();
  }
}
