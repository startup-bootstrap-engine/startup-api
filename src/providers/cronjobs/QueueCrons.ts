import { QueueCleaner } from "@providers/queue/QueueCleaner";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(QueueCrons)
export class QueueCrons {
  constructor(private cronJobScheduler: CronJobScheduler, private queueCleaner: QueueCleaner) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("queue-clean-inactive", "*/5 * * * *", async () => {
      await this.cleanupInactiveQueues();
    });
  }

  private async cleanupInactiveQueues(): Promise<void> {
    await this.queueCleaner.closeInactiveQueues();
  }
}
