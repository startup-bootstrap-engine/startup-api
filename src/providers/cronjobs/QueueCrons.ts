import { QueueActivityMonitor } from "@providers/queue/QueueActivityMonitor";
import { QueuePerformanceTracker } from "@providers/queue/QueuePerformanceTracker";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(QueueCrons)
export class QueueCrons {
  constructor(
    private cronJobScheduler: CronJobScheduler,
    private queueActivityMonitor: QueueActivityMonitor,
    private queuePerformanceTracker: QueuePerformanceTracker
  ) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("queue-clean-inactive", "*/5 * * * *", async () => {
      await this.cleanupInactiveQueues();
    });

    this.cronJobScheduler.uniqueSchedule("queue-track-performance-ratio", "*/5 * * * *", async () => {
      await this.trackQueuePerformanceRatio();
    });
  }

  private async cleanupInactiveQueues(): Promise<void> {
    await this.queueActivityMonitor.closeInactiveQueues();
  }

  private async trackQueuePerformanceRatio(): Promise<void> {
    await this.queuePerformanceTracker.trackQueuePerformanceRatio();
  }
}
