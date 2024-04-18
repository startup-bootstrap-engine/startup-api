import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Queue as QueueMQ } from "bullmq";

interface IBullBoard {
  addQueue: (queue: BullMQAdapter) => void;
  removeQueue: (queue: BullMQAdapter) => void;
}

@provideSingleton(BullBoardMonitor)
export class BullBoardMonitor {
  private serverAdapter: ExpressAdapter;
  private bullBoard: IBullBoard;
  private queues: Map<string, BullMQAdapter>;

  public init(): void {
    this.serverAdapter = new ExpressAdapter();
    this.serverAdapter.setBasePath("/admin/queues");
    this.queues = new Map();
    this.bullBoard = createBullBoard({
      queues: [],
      serverAdapter: this.serverAdapter,
    });
  }

  public addQueue(queueName: string, connectionConfig: any): void {
    const queue = new QueueMQ(queueName, connectionConfig);
    const adapter = new BullMQAdapter(queue);
    this.queues.set(queueName, adapter);
    this.bullBoard.addQueue(adapter);
    console.log(`Queue ${queueName} added to Bull Board`);
  }

  public removeQueue(queueName: string): void {
    const adapter = this.queues.get(queueName);
    if (adapter) {
      this.bullBoard.removeQueue(adapter);
      this.queues.delete(queueName);
      console.log(`Queue ${queueName} removed from Bull Board`);
    } else {
      console.log(`Queue ${queueName} not found`);
    }
  }

  public getRouter(): any {
    return this.serverAdapter.getRouter();
  }
}
