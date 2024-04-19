import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { QUEUE_BULL_MONITOR_REFRESH_INTERVAL } from "@providers/constants/QueueConstants";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { Queue as QueueMQ } from "bullmq";
import { Redis } from "ioredis";
import { QueueActivityMonitor } from "./QueueActivityMonitor";

interface IBullBoard {
  addQueue: (queue: BullMQAdapter) => void;
  removeQueue: (queue: BullMQAdapter) => void;
}

@provideSingleton(BullBoardMonitor)
export class BullBoardMonitor {
  private serverAdapter: ExpressAdapter;
  private bullBoard: IBullBoard;
  private monitoredQueues: Map<string, BullMQAdapter>;

  constructor(
    private queueActivityMonitor: QueueActivityMonitor,
    private redisManager: RedisManager,
    private locker: Locker
  ) {}

  public async init(): Promise<void> {
    try {
      this.serverAdapter = new ExpressAdapter();
      this.serverAdapter.setBasePath("/admin/queues");
      this.monitoredQueues = new Map();
      this.bullBoard = createBullBoard({
        queues: [],
        serverAdapter: this.serverAdapter,
      });

      let isRefreshing = false;

      const refreshQueuesPeriodically = async (): Promise<void> => {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            await this.refreshQueues();
          } finally {
            isRefreshing = false;
          }
        }
        setTimeout(refreshQueuesPeriodically, QUEUE_BULL_MONITOR_REFRESH_INTERVAL);
      };

      await refreshQueuesPeriodically();
    } catch (error) {
      console.error(error);
    }
  }

  private async refreshQueues(): Promise<void> {
    const queueNames = await this.queueActivityMonitor.getAllQueues();

    const connection = await this.redisManager.getPoolClient("bull-board-monitor");

    try {
      for (const queueName of queueNames) {
        // const connectionConfig = await this.redisManager.getConnectionConfig(queueName);

        // if queue is not tracked yet
        if (!this.monitoredQueues.has(queueName)) {
          // this.addQueue(queueName, connectionConfig);
          this.addQueue(queueName, connection);
        }
      }

      // if there's a mismatch between the queues we're tracking and the queues in the database, we should cleanup our state
      for (const queue of this.monitoredQueues.keys()) {
        if (!queueNames.includes(queue)) {
          this.removeQueue(queue);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      await this.redisManager.releasePoolClient(connection);
    }
  }

  private addQueue(queueName: string, connection: Redis): void {
    if (this.monitoredQueues.has(queueName)) {
      return;
    }

    const queue = new QueueMQ(queueName, {
      connection,
    });
    const adapter = new BullMQAdapter(queue);
    this.monitoredQueues.set(queueName, adapter);
    this.bullBoard.addQueue(adapter);
  }

  private removeQueue(queueName: string): void {
    const adapter = this.monitoredQueues.get(queueName);
    if (adapter) {
      this.bullBoard.removeQueue(adapter);
      this.monitoredQueues.delete(queueName);
    } else {
      console.log(`BullBoard: Queue ${queueName} not found`);
    }
  }

  public getRouter(): any {
    return this.serverAdapter.getRouter();
  }
}
