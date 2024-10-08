import os from "os";

export const USER_CONTROL_ONLINE = {
  MAX_NUMBER_OF_PLAYERS: 100,
  MAX_NUMBER_ACC_PER_USER: 20,
};

export const SERVER_API_NODES_QTY = 4; // 4 nodes on hertzner for API only

export const SERVER_API_NODES_PM2_PROCESSES_QTY = 4; // 4 processes per node

// 10 min
export const SERVER_DISCONNECT_IDLE_TIMEOUT = 10; // how many minutes does a character needs to be inactive to be disconnected

export const USER_EXHAUST_TIMEOUT = 1000;

export const EXHAUSTABLE_EVENTS = ["UseWithItem"] as string[];

export const CUSTOM_EXHAUSTABLE_EVENTS = {};

export const LOGGABLE_EVENTS = ["CastSpell"];

export const LOCKABLE_EVENTS = [] as string[];

export const THROTTABLE_EVENTS_MS_THRESHOLD_DISCONNECT = 20;

export const THROTTABLE_DEFAULT_MS_THRESHOLD = 1000;

export const THROTTABLE_EVENTS = {};

export const PROMISE_DEFAULT_CONCURRENCY = os.cpus().length || SERVER_API_NODES_PM2_PROCESSES_QTY;

export const MAX_PING_TRACKING_THRESHOLD = 10000;
