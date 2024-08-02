import { QUEUE_INACTIVITY_THRESHOLD_MS } from "@providers/constants/QueueConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { container } from "@providers/inversify/container";
import { Queue } from "bullmq";
import { QueueActivityMonitor } from "../QueueActivityMonitor";

describe("QueueActivityMonitor", () => {
  let queueActivityMonitor: QueueActivityMonitor;

  beforeEach(() => {
    jest.spyOn(InMemoryHashTable.prototype, "set").mockResolvedValue();
    jest.spyOn(InMemoryHashTable.prototype, "has").mockResolvedValue(false);
    jest.spyOn(InMemoryHashTable.prototype, "getAllKeys").mockResolvedValue([]);
    jest.spyOn(InMemoryHashTable.prototype, "delete").mockResolvedValue();
    jest.spyOn(InMemoryHashTable.prototype, "deleteAll").mockResolvedValue();
    jest.spyOn(InMemoryHashTable.prototype, "getAll").mockResolvedValue({});

    queueActivityMonitor = container.get(QueueActivityMonitor);

    // @ts-ignore
    jest.spyOn(queueActivityMonitor.redisManager, "getPoolClient").mockResolvedValue({});
    // @ts-ignore
    jest.spyOn(queueActivityMonitor.redisManager, "releasePoolClient").mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  describe("updateQueueActivity", () => {
    it("should update the last activity time for a queue", async () => {
      const queueName = "testQueue";
      await queueActivityMonitor.updateQueueActivity(queueName);

      expect(InMemoryHashTable.prototype.set).toHaveBeenCalledWith("queue-activity", queueName, expect.any(String));
    });
  });

  describe("hasQueueActivity", () => {
    it("should check if a queue has activity", async () => {
      const queueName = "testQueue";
      jest.spyOn(InMemoryHashTable.prototype, "has").mockResolvedValue(true);

      const result = await queueActivityMonitor.hasQueueActivity(queueName);

      expect(result).toBe(true);
      expect(InMemoryHashTable.prototype.has).toHaveBeenCalledWith("queue-activity", queueName);
    });
  });

  describe("getAllQueues", () => {
    it("should return all queue names", async () => {
      const mockQueues = ["queue1", "queue2"];
      jest.spyOn(InMemoryHashTable.prototype, "getAllKeys").mockResolvedValue(mockQueues);

      const result = await queueActivityMonitor.getAllQueues();

      expect(result).toEqual(mockQueues);
      expect(InMemoryHashTable.prototype.getAllKeys).toHaveBeenCalledWith("queue-activity");
    });
  });

  describe("deleteQueueActivity", () => {
    it("should delete activity for a specific queue", async () => {
      const queueName = "testQueue";
      await queueActivityMonitor.deleteQueueActivity(queueName);

      expect(InMemoryHashTable.prototype.delete).toHaveBeenCalledWith("queue-activity", queueName);
    });
  });

  describe("clearAllQueues", () => {
    it("should clear all queue activities", async () => {
      await queueActivityMonitor.clearAllQueues();

      expect(InMemoryHashTable.prototype.deleteAll).toHaveBeenCalledWith("queue-activity");
    });
  });

  describe("closeInactiveQueues", () => {
    it("should close inactive queues and track metrics", async () => {
      const mockQueues = {
        activeQueue: Date.now().toString(),
        inactiveQueue: (Date.now() - QUEUE_INACTIVITY_THRESHOLD_MS - 1000).toString(),
      };
      jest.spyOn(InMemoryHashTable.prototype, "getAll").mockResolvedValue(mockQueues);

      const mockQueue = {
        getActive: jest.fn().mockResolvedValue([]),
        close: jest.fn().mockResolvedValue(undefined),
      };
      (Queue as jest.MockedClass<typeof Queue>).mockImplementation(() => mockQueue as any);

      await queueActivityMonitor.closeInactiveQueues();

      expect(InMemoryHashTable.prototype.delete).toHaveBeenCalledWith("queue-activity", "inactiveQueue");
      // @ts-ignore
      expect(queueActivityMonitor.redisManager.releasePoolClient).toHaveBeenCalled();
    });
  });
});
