export const QUEUE_INACTIVITY_THRESHOLD = 60 * 10 * 1000; // 10 min

export const QUEUE_CLOSE_CHECK_MAX_TRIES = 10; // Set your desired maximum number of tries

export const QUEUE_SCALE_FACTOR_DEFAULT = 1; // Careful with this number. Higher it its, more queues will be created and more redis connections, consuming more resources

export const QUEUE_NPC_MAX_SCALE_FACTOR = 3;
