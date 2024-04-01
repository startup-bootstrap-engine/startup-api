import { QueueActivityMonitor } from "@providers/queue/QueueActivityMonitor";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(QueueCrons)
export class QueueCrons {
  constructor(private cronJobScheduler: CronJobScheduler, private queueActivityMonitor: QueueActivityMonitor) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("queue-clean-inactive", "*/5 * * * *", async () => {
      await this.cleanupInactiveQueues();
    });
  }

  private async cleanupInactiveQueues(): Promise<void> {
    await this.queueActivityMonitor.closeInactiveQueues();
  }
}
