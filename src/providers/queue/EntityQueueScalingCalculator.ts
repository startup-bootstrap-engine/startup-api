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
    // Define a scaling factor based on your system's capacity and the expected load per NPC
    const scalingFactor = QUEUE_WORKER_CONCURRENCY_SCALING_FACTOR;

    // Calculate the concurrency as a linear function of the number of active NPCs
    let concurrency = QUEUE_WORKER_MIN_CONCURRENCY + activeEntities * scalingFactor;

    // Ensure the concurrency stays within the min and max limits
    concurrency = Math.max(concurrency, QUEUE_WORKER_MIN_CONCURRENCY);
    concurrency = Math.min(concurrency, QUEUE_WORKER_MAX_CONCURRENCY);

    return Math.ceil(concurrency);
  }

  public calculateMaxLimiter(activeEntities: number): number {
    // Define a scaling factor based on your system's capacity and the expected load per NPC
    const scalingFactor = QUEUE_WORKER_JOB_RATE_SCALING_FACTOR;

    // Calculate the rate as a linear function of the number of active NPCs
    let rate = QUEUE_WORKER_MIN_JOB_RATE + activeEntities * scalingFactor;

    // Ensure the rate stays within the min and max limits
    rate = Math.max(rate, QUEUE_WORKER_MIN_JOB_RATE);
    rate = Math.min(rate, QUEUE_WORKER_MAX_JOB_RATE);

    return Math.ceil(rate);
  }
}
