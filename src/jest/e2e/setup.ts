import { container, inMemoryHashTable, redisManager } from "@providers/inversify/container";
import { app } from "@providers/server/app";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Force disconnect any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Create new mongo memory server
  mongoServer = await MongoMemoryServer.create();

  // Connect to the in-memory database
  await mongoose.connect(mongoServer.getUri(), {
    dbName: "test-database",
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

  // Initialize other services
  await redisManager.connect();
  await inMemoryHashTable.init();
});

afterAll(async () => {
  // Clean up database
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }

  // Stop mongo memory server
  if (mongoServer) {
    await mongoServer.stop({
      doCleanup: true,
      force: true,
    });
  }

  // Clean up other services
  container.unload();
  await redisManager.client?.flushall();
});

beforeEach(async () => {
  // Clear database before each test
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
  }
});

export const testRequest = request(app);
