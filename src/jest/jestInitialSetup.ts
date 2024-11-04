import "express-async-errors";
import "reflect-metadata";
import redis from "./redisV4Mock";

//! Useful for debugging during tests
process.env.DEBUG_MODE = "true";

// Mock environment variables before any imports
const envVars = {
  MODULE_REDIS: "true",
  MODULE_REDIS_STREAMS: "false",
  MODULE_REDIS_PUBSUB: "false",
  MODULE_BULLMQ: "false",
  MODULE_WEBSOCKET: "false",
  MODULE_RABBITMQ: "false",
  MODULE_MONGODB: "true",
  MODULE_POSTGRESQL: "false",
  MODULE_PRISMA_STUDIO: "false",
  MODULE_PGADMIN: "false",
};

Object.assign(process.env, envVars);

jest.setTimeout(30000);

jest.mock("redis", () => redis);

jest.mock("@rpg-engine/newrelic", () => ({
  startBackgroundTransaction: jest.fn(),
  endTransaction: jest.fn(),
  recordMetric: jest.fn(),
}));

jest.mock("bullmq", () => ({
  Queue: jest.fn(() => ({
    add: jest.fn(),
  })),
  Worker: jest.fn(() => ({
    on: jest.fn(),
  })),
  Job: jest.fn(),
}));
