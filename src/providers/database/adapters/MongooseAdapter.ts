import { appEnv } from "@providers/config/env";
import { provide } from "inversify-binding-decorators";
import mongoose from "mongoose";

import { IDatabaseAdapter } from "../DatabaseTypes";

@provide(MongooseAdapter)
export class MongooseAdapter implements IDatabaseAdapter {
  public async initialize(): Promise<void> {
    await mongoose.connect(
      `mongodb://${appEnv.database.MONGO_INITDB_ROOT_USERNAME}:${appEnv.database.MONGO_INITDB_ROOT_PASSWORD}@${appEnv.database.MONGO_HOST_CONTAINER}:${appEnv.database.MONGO_PORT}/${appEnv.database.MONGO_INITDB_DATABASE}?authSource=admin`,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        dbName: process.env.MONGO_INITDB_DATABASE,
        minPoolSize: 50,
        maxPoolSize: 300,
      }
    );
    console.log(
      `✅ Connected to the MongoDB database on Docker container ${appEnv.database.MONGO_HOST_CONTAINER} at port ${appEnv.database.MONGO_PORT}`
    );
  }

  public async close(): Promise<void> {
    await mongoose.disconnect();
    console.log(
      `✅ Disconnected from the MongoDB database on Docker container ${appEnv.database.MONGO_HOST_CONTAINER} at port ${appEnv.database.MONGO_PORT}`
    );
  }
}
