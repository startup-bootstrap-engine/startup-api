export const QUEUE_BULL_MONITOR_REFRESH_INTERVAL = 60 * 1000;

export const QUEUE_INACTIVITY_THRESHOLD_MS = 60 * 1 * 1000; // 1 min

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

export const QUEUE_CONNECTION_CHECK_INTERVAL = 30 * 1000; // 30 sec
// Concurrency
export const QUEUE_WORKER_MIN_CONCURRENCY = 100; // 100-300 is the standard
export const QUEUE_WORKER_MAX_CONCURRENCY = 800; // Max concurrency the system can handle
export const QUEUE_WORKER_CONCURRENCY_SCALING_FACTOR = 2;

export const QUEUE_WORKER_JOB_RATE_SCALING_FACTOR = 0.5;
export const QUEUE_WORKER_MIN_JOB_RATE = 50; // Min jobs per second per NPC
export const QUEUE_WORKER_MAX_JOB_RATE = 600; // Max jobs per second per NPC
