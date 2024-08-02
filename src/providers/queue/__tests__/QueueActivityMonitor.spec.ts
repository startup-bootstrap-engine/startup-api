import { QUEUE_INACTIVITY_THRESHOLD_MS } from "@providers/constants/QueueConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { container } from "@providers/inversify/container";
import { QueueActivityMonitor } from "../QueueActivityMonitor";

describe("QueueActivityMonitor", () => {
  let queueActivityMonitor: QueueActivityMonitor;
  let inMemoryHashTable: InMemoryHashTable;

  beforeEach(() => {
    // Get real instance from the container
    inMemoryHashTable = container.get(InMemoryHashTable);
    queueActivityMonitor = container.get(QueueActivityMonitor);

    // Mock RedisManager methods
    // @ts-ignore
    jest.spyOn(queueActivityMonitor.redisManager, "getPoolClient").mockResolvedValue({}); // Mock pool client
    // @ts-ignore
    jest.spyOn(queueActivityMonitor.redisManager, "releasePoolClient").mockResolvedValue();
  });

  afterEach(async () => {
    // Restore all mocks to their original implementation
    jest.restoreAllMocks();
    // Ensure timers are cleared
    jest.clearAllTimers();

    // Release any active connections
    // @ts-ignore
    if (queueActivityMonitor.connection) {
      // @ts-ignore
      await queueActivityMonitor.redisManager.releasePoolClient(queueActivityMonitor.connection);
      // @ts-ignore
      queueActivityMonitor.connection = null;
    }
  });

  describe("updateQueueActivity", () => {
    it("should update the last activity time for a queue", async () => {
      const queueName = "testQueue";
      await queueActivityMonitor.updateQueueActivity(queueName);

      const lastActivity = await inMemoryHashTable.get("queue-activity", queueName);
      expect(lastActivity).toBeDefined();
    });
  });

  describe("hasQueueActivity", () => {
    it("should check if a queue has activity", async () => {
      const queueName = "testQueue";
      await inMemoryHashTable.set("queue-activity", queueName, Date.now().toString());

      const result = await queueActivityMonitor.hasQueueActivity(queueName);

      expect(result).toBe(true);
    });
  });

  describe("getAllQueues", () => {
    it("should return all queue names", async () => {
      const mockQueues = ["queue1", "queue2"];
      await inMemoryHashTable.set("queue-activity", "queue1", Date.now().toString());
      await inMemoryHashTable.set("queue-activity", "queue2", Date.now().toString());

      const result = await queueActivityMonitor.getAllQueues();

      expect(result).toEqual(expect.arrayContaining(mockQueues));
    });
  });

  describe("deleteQueueActivity", () => {
    it("should delete activity for a specific queue", async () => {
      const queueName = "testQueue";
      await inMemoryHashTable.set("queue-activity", queueName, Date.now().toString());

      await queueActivityMonitor.deleteQueueActivity(queueName);

      const hasActivity = await inMemoryHashTable.has("queue-activity", queueName);
      expect(hasActivity).toBe(false);
    });
  });

  describe("clearAllQueues", () => {
    it("should clear all queue activities", async () => {
      await inMemoryHashTable.set("queue-activity", "queue1", Date.now().toString());
      await inMemoryHashTable.set("queue-activity", "queue2", Date.now().toString());

      await queueActivityMonitor.clearAllQueues();

      const allKeys = await inMemoryHashTable.getAllKeys("queue-activity");
      expect(allKeys).toEqual([]);
    });
  });

  describe("closeInactiveQueues", () => {
    it("should close inactive queues and track metrics", async () => {
      const activeQueueName = "activeQueue";
      const inactiveQueueName = "inactiveQueue";

      // Set active queue with recent activity
      await inMemoryHashTable.set("queue-activity", activeQueueName, (Date.now() - 500).toString());

      // Set inactive queue with old activity
      await inMemoryHashTable.set(
        "queue-activity",
        inactiveQueueName,
        (Date.now() - QUEUE_INACTIVITY_THRESHOLD_MS - 1000).toString()
      );

      // @ts-ignore
      const shutdownSpy = jest.spyOn(queueActivityMonitor as any, "shutdownInactiveQueue").mockResolvedValue();

      await queueActivityMonitor.closeInactiveQueues();

      expect(shutdownSpy).toHaveBeenCalledWith(inactiveQueueName);
      expect(shutdownSpy).not.toHaveBeenCalledWith(activeQueueName);

      shutdownSpy.mockRestore();
    });
  });
});
