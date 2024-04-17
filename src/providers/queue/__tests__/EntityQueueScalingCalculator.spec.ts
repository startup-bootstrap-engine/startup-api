import {
  QUEUE_WORKER_MAX_CONCURRENCY,
  QUEUE_WORKER_MAX_JOB_RATE,
  QUEUE_WORKER_MIN_CONCURRENCY,
  QUEUE_WORKER_MIN_JOB_RATE,
} from "@providers/constants/QueueConstants";
import { container } from "@providers/inversify/container";
import { EntityQueueScalingCalculator } from "../EntityQueueScalingCalculator";

describe("EntityQueueScalingCalculator", () => {
  let entityQueueScalingCalculator: EntityQueueScalingCalculator;

  beforeAll(() => {
    entityQueueScalingCalculator = container.get(EntityQueueScalingCalculator);
  });

  it("should properly calculate concurrency for minimum limit", () => {
    expect(entityQueueScalingCalculator.calculateConcurrency(0)).toBe(QUEUE_WORKER_MIN_CONCURRENCY);
  });

  it("should properly calculate concurrency for maximum limit", () => {
    expect(entityQueueScalingCalculator.calculateConcurrency(1000)).toBe(QUEUE_WORKER_MAX_CONCURRENCY);
  });

  it("should calculate limiter correctly", () => {
    const limiter = entityQueueScalingCalculator.calculateMaxLimiter(0);
    expect(limiter).toBeGreaterThanOrEqual(QUEUE_WORKER_MIN_JOB_RATE);
  });

  it("should calculate concurrency correctly with negative active NPCs", () => {
    (entityQueueScalingCalculator as any).activeNPCs = -5;
    expect(entityQueueScalingCalculator.calculateConcurrency(-5)).toBe(QUEUE_WORKER_MIN_CONCURRENCY);
  });

  it("should calculate correct limiter when active NPCs are very high", () => {
    (entityQueueScalingCalculator as any).activeNPCs = 5000;
    const limiter = entityQueueScalingCalculator.calculateMaxLimiter(5000);
    expect(limiter).toBe(QUEUE_WORKER_MAX_JOB_RATE);
  });

  it("should return default rate when no active NPCs present", () => {
    (entityQueueScalingCalculator as any).activeNPCs = 0;
    const limiter = entityQueueScalingCalculator.calculateMaxLimiter(0);
    expect(limiter).toBe(QUEUE_WORKER_MIN_JOB_RATE);
  });
});
