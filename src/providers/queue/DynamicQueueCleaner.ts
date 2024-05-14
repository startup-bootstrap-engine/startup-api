import { QUEUE_CONNECTION_CHECK_INTERVAL } from "@providers/constants/QueueConstants";
import { RedisManager } from "@providers/database/RedisManager";
import { Locker } from "@providers/locks/Locker";
import { Queue, Worker } from "bullmq";
import { provide } from "inversify-binding-decorators";
import Redis from "ioredis";
import { QueueActivityMonitor } from "./QueueActivityMonitor";

@provide(DynamicQueueCleaner)
export class DynamicQueueCleaner {
  constructor(
    private redisManager: RedisManager,
    private queueActivityMonitor: QueueActivityMonitor,
    private locker: Locker
  ) {}

  // Remember each redis client connection consume resources, so it's important to release them when they're no longer needed
  public async monitorAndReleaseInactiveQueueRedisConnections(
    queues: Map<string, Queue>,
    workers: Map<string, Worker>,
    queueConnections: Map<string, Redis>,
    queueName: string,
    connection: Redis
  ): Promise<void> {
    const lockKey = `queue-connection-monitor-${queueName}`;
    const canProceed = await this.locker.lock(lockKey);
    if (!canProceed) {
      return;
    }

    queueConnections.set(queueName, connection);
    let queueConnectionInterval: NodeJS.Timeout | null = null;

    try {
      queueConnectionInterval = setInterval(async () => {
        try {
          const hasQueueActivity = await this.queueActivityMonitor.hasQueueActivity(queueName);
          if (!hasQueueActivity) {
            await this.performResourceCleanup(queues, workers, queueConnections, queueName, connection);
            if (queueConnectionInterval) {
              clearInterval(queueConnectionInterval);
            }
            await this.locker.unlock(lockKey);
          }
        } catch (error) {
          console.error(`Error during resource monitoring for queue ${queueName}: ${error}`);
          if (queueConnectionInterval) {
            clearInterval(queueConnectionInterval);
          }
          await this.locker.unlock(lockKey);
        }
      }, QUEUE_CONNECTION_CHECK_INTERVAL);
    } catch (error) {
      console.error(`Failed to initiate resource monitoring for queue ${queueName}: ${error}`);
      if (queueConnectionInterval) {
        clearInterval(queueConnectionInterval);
      }
    } finally {
      await this.locker.unlock(lockKey);
    }
  }

  private async performResourceCleanup(
    queues: Map<string, Queue>,
    workers: Map<string, Worker>,
    queueConnections: Map<string, Redis>,
    queueName: string,
    connection: Redis
  ): Promise<void> {
    try {
      const worker = workers.get(queueName);
      if (worker) {
        await worker.close();
        workers.delete(queueName);
      }

      const queue = queues.get(queueName);
      if (queue) {
        await queue.close();
        await queue.obliterate({
          force: true,
        });
        queues.delete(queueName);
      }

      console.log(`🔒 Releasing connection for queue ${queueName}`);
    } catch (error) {
      console.error(`Error during resource cleanup for queue ${queueName}:`, error);
    } finally {
      try {
        await this.redisManager.releasePoolClient(connection);
      } catch (releaseError) {
        console.error(`Error releasing Redis connection for queue ${queueName}:`, releaseError);
      } finally {
        queueConnections.delete(queueName);
      }
    }
  }

  public async clearAllJobs(queues: Map<string, Queue>): Promise<void> {
    for (const [queueName, queue] of queues.entries()) {
      const jobs = await queue.getJobs(["waiting", "active", "delayed", "paused"]);
      for (const job of jobs) {
        await job
          .remove()
          .catch((err) => console.error(`Error removing job ${job.id} from queue ${queueName}:`, err.message));
      }
    }
  }

  public async shutdown(queues: Map<string, Queue>, workers: Map<string, Worker>): Promise<void> {
    for (const [queueName, queue] of queues.entries()) {
      const worker = workers.get(queueName);
      if (worker) {
        await worker
          .close()
          .catch((err) => console.error(`Error shutting down worker for queue ${queueName}:`, err.message));
        // Optionally, remove the worker from the workers map if it's no longer needed
        workers.delete(queueName);
      }

      await queue.close().catch((err) => console.error(`Error shutting down queue ${queueName}:`, err.message));
      // Optionally, remove the queue from the queues map if it's no longer needed
      queues.delete(queueName);

      // Update the queue activity monitor if necessary
      await this.queueActivityMonitor.deleteQueueActivity(queueName);
    }
  }
}
