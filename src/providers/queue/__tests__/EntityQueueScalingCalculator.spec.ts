import {
  QUEUE_WORKER_CONCURRENCY_SCALING_FACTOR,
  QUEUE_WORKER_JOB_RATE_SCALING_FACTOR,
  QUEUE_WORKER_MAX_CONCURRENCY,
  QUEUE_WORKER_MAX_JOB_RATE,
  QUEUE_WORKER_MIN_CONCURRENCY,
  QUEUE_WORKER_MIN_JOB_RATE,
} from "@providers/constants/QueueConstants";
import { container } from "@providers/inversify/container";
import { EntityQueueScalingCalculator } from "../EntityQueueScalingCalculator";

describe("EntityQueueScalingCalculator", () => {
  let entityQueueScalingCalculator: EntityQueueScalingCalculator;

  beforeEach(() => {
    entityQueueScalingCalculator = container.get(EntityQueueScalingCalculator);
  });

  describe("calculateConcurrency", () => {
    it("should return minimum concurrency for 0 active entities", () => {
      expect(entityQueueScalingCalculator.calculateConcurrency(0)).toBe(QUEUE_WORKER_MIN_CONCURRENCY);
    });

    it("should return minimum concurrency for negative active entities", () => {
      expect(entityQueueScalingCalculator.calculateConcurrency(-5)).toBe(QUEUE_WORKER_MIN_CONCURRENCY);
    });

    it("should return maximum concurrency for very large number of active entities", () => {
      expect(entityQueueScalingCalculator.calculateConcurrency(1000000)).toBe(QUEUE_WORKER_MAX_CONCURRENCY);
    });

    it("should calculate concurrency correctly for a moderate number of active entities", () => {
      const activeEntities = 100;
      const expectedConcurrency = Math.ceil(
        Math.min(
          Math.max(
            QUEUE_WORKER_MIN_CONCURRENCY + activeEntities * QUEUE_WORKER_CONCURRENCY_SCALING_FACTOR,
            QUEUE_WORKER_MIN_CONCURRENCY
          ),
          QUEUE_WORKER_MAX_CONCURRENCY
        )
      );
      expect(entityQueueScalingCalculator.calculateConcurrency(activeEntities)).toBe(expectedConcurrency);
    });

    it("should handle non-integer active entities by rounding up the result", () => {
      const result = entityQueueScalingCalculator.calculateConcurrency(10.5);
      expect(Number.isInteger(result)).toBe(true);
    });

    it("should handle NaN input", () => {
      expect(entityQueueScalingCalculator.calculateConcurrency(NaN)).toBe(QUEUE_WORKER_MIN_CONCURRENCY);
    });

    it("should handle Infinity input", () => {
      expect(entityQueueScalingCalculator.calculateConcurrency(Infinity)).toBe(QUEUE_WORKER_MAX_CONCURRENCY);
    });
  });

  describe("calculateMaxLimiter", () => {
    it("should return minimum job rate for 0 active entities", () => {
      expect(entityQueueScalingCalculator.calculateMaxLimiter(0)).toBe(QUEUE_WORKER_MIN_JOB_RATE);
    });

    it("should return minimum job rate for negative active entities", () => {
      expect(entityQueueScalingCalculator.calculateMaxLimiter(-5)).toBe(QUEUE_WORKER_MIN_JOB_RATE);
    });

    it("should return maximum job rate for very large number of active entities", () => {
      expect(entityQueueScalingCalculator.calculateMaxLimiter(1000000)).toBe(QUEUE_WORKER_MAX_JOB_RATE);
    });

    it("should calculate max limiter correctly for a moderate number of active entities", () => {
      const activeEntities = 100;
      const expectedRate = Math.ceil(
        Math.min(
          Math.max(
            QUEUE_WORKER_MIN_JOB_RATE + activeEntities * QUEUE_WORKER_JOB_RATE_SCALING_FACTOR,
            QUEUE_WORKER_MIN_JOB_RATE
          ),
          QUEUE_WORKER_MAX_JOB_RATE
        )
      );
      expect(entityQueueScalingCalculator.calculateMaxLimiter(activeEntities)).toBe(expectedRate);
    });

    it("should handle non-integer active entities by rounding up the result", () => {
      const result = entityQueueScalingCalculator.calculateMaxLimiter(10.5);
      expect(Number.isInteger(result)).toBe(true);
    });

    it("should handle NaN input", () => {
      expect(entityQueueScalingCalculator.calculateMaxLimiter(NaN)).toBe(QUEUE_WORKER_MIN_JOB_RATE);
    });

    it("should handle Infinity input", () => {
      expect(entityQueueScalingCalculator.calculateMaxLimiter(Infinity)).toBe(QUEUE_WORKER_MAX_JOB_RATE);
    });
  });

  describe("edge cases", () => {
    it("should handle string input by returning minimum values", () => {
      // @ts-ignore: Intentionally passing invalid type for testing
      expect(entityQueueScalingCalculator.calculateConcurrency("invalid")).toBe(QUEUE_WORKER_MIN_CONCURRENCY);
      // @ts-ignore: Intentionally passing invalid type for testing
      expect(entityQueueScalingCalculator.calculateMaxLimiter("invalid")).toBe(QUEUE_WORKER_MIN_JOB_RATE);
    });

    it("should handle null input by returning minimum values", () => {
      // @ts-ignore: Intentionally passing invalid type for testing
      expect(entityQueueScalingCalculator.calculateConcurrency(null)).toBe(QUEUE_WORKER_MIN_CONCURRENCY);
      // @ts-ignore: Intentionally passing invalid type for testing
      expect(entityQueueScalingCalculator.calculateMaxLimiter(null)).toBe(QUEUE_WORKER_MIN_JOB_RATE);
    });

    it("should handle undefined input by returning minimum values", () => {
      // @ts-ignore: Intentionally passing invalid type for testing
      expect(entityQueueScalingCalculator.calculateConcurrency(undefined)).toBe(QUEUE_WORKER_MIN_CONCURRENCY);
      // @ts-ignore: Intentionally passing invalid type for testing
      expect(entityQueueScalingCalculator.calculateMaxLimiter(undefined)).toBe(QUEUE_WORKER_MIN_JOB_RATE);
    });
  });
});
