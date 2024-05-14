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

    try {
      // Only set the interval once when the lock is acquired.
      const queueConnectionInterval = setInterval(async () => {
        try {
          const hasQueueActivity = await this.queueActivityMonitor.hasQueueActivity(queueName);
          if (!hasQueueActivity) {
            // Perform resource cleanup
            await this.performResourceCleanup(queues, workers, queueConnections, queueName, connection);

            // After cleanup, clear the interval and release the lock
            clearInterval(queueConnectionInterval);
            await this.locker.unlock(lockKey);
          }
        } catch (error) {
          console.error(`Error during resource monitoring for queue ${queueName}: ${error}`);
        }
      }, QUEUE_CONNECTION_CHECK_INTERVAL);
    } catch (error) {
      console.error(`Failed to initiate resource monitoring for queue ${queueName}: ${error}`);
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
      console.error(error);
    } finally {
      await this.redisManager.releasePoolClient(connection);
      queueConnections.delete(queueName);
    }
  }
}
