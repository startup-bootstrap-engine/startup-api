import "express-async-errors";
import "reflect-metadata";
import redis from "./redisV4Mock";

//! Useful for debugging during tests
process.env.DEBUG_MODE = "true";

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
