export const QUEUE_INACTIVITY_THRESHOLD = 60 * 10 * 1000; // 10 min

export const QUEUE_CLOSE_CHECK_MAX_TRIES = 10; // Set your desired maximum number of tries

// Remember this is by process and instance. So these numbers can easily skyrocket!
export const QUEUE_NPC_MAX_SCALE_FACTOR = 3;
export const QUEUE_CHARACTER_MAX_SCALE_FACTOR = 3;

export enum QueueDefaultScaleFactor {
  Low = 1,
  Medium = 5,
  High = 10,
}
