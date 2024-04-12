export const QUEUE_INACTIVITY_THRESHOLD_MS = 60 * 3 * 1000; // 3 min

export const QUEUE_CLOSE_CHECK_MAX_TRIES = 10; // Set your desired maximum number of tries

// Remember this is by process and instance. So these numbers can easily skyrocket! Currently we have 4x 4 CPU instances running, so 16 total for EACH queue on a 1 Factor.
export const QUEUE_NPC_MAX_SCALE_FACTOR = 2;
export const QUEUE_CHARACTER_MAX_SCALE_FACTOR = 2;

export enum QueueDefaultScaleFactor {
  Low = 1,
  Medium = 5,
  High = 10,
}

export const QUEUE_NPC_CYCLE_CUSTOM_SCALE = 4;

export const QUEUE_CONNECTION_CHECK_INTERVAL = 60 * 1000; // 1 min

// Rate limiting
export const QUEUE_GLOBAL_WORKER_LIMITER_MAX = 30;
export const QUEUE_GLOBAL_WORKER_LIMITER_DURATION = 1000;

// Concurrency
export const QUEUE_WORKER_CONCURRENCY = 100; // 100-300 is the standard
