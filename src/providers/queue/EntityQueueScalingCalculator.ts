import {
  QUEUE_WORKER_CONCURRENCY_SCALING_FACTOR,
  QUEUE_WORKER_JOB_RATE_SCALING_FACTOR,
  QUEUE_WORKER_MAX_CONCURRENCY,
  QUEUE_WORKER_MAX_JOB_RATE,
  QUEUE_WORKER_MIN_CONCURRENCY,
  QUEUE_WORKER_MIN_JOB_RATE,
} from "@providers/constants/QueueConstants";
import { provideSingleton } from "@providers/inversify/provideSingleton";

@provideSingleton(EntityQueueScalingCalculator)
export class EntityQueueScalingCalculator {
  public calculateConcurrency(activeEntities: number): number {
    const validActiveEntities = this.validateActiveEntities(activeEntities);
    const scalingFactor = QUEUE_WORKER_CONCURRENCY_SCALING_FACTOR;
    let concurrency = QUEUE_WORKER_MIN_CONCURRENCY + validActiveEntities * scalingFactor;
    concurrency = Math.max(concurrency, QUEUE_WORKER_MIN_CONCURRENCY);
    concurrency = Math.min(concurrency, QUEUE_WORKER_MAX_CONCURRENCY);
    return Math.ceil(concurrency);
  }

  public calculateMaxLimiter(activeEntities: number): number {
    const validActiveEntities = this.validateActiveEntities(activeEntities);
    const scalingFactor = QUEUE_WORKER_JOB_RATE_SCALING_FACTOR;
    let rate = QUEUE_WORKER_MIN_JOB_RATE + validActiveEntities * scalingFactor;
    rate = Math.max(rate, QUEUE_WORKER_MIN_JOB_RATE);
    rate = Math.min(rate, QUEUE_WORKER_MAX_JOB_RATE);
    return Math.ceil(rate);
  }

  private validateActiveEntities(activeEntities: number): number {
    if (typeof activeEntities !== "number" || isNaN(activeEntities) || activeEntities < 0) {
      console.error(`Invalid activeEntities value: ${activeEntities}. Defaulting to 0.`);
      return 0;
    }
    return activeEntities;
  }
}
