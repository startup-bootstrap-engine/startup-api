import { appEnv } from "@providers/config/env";
import { provide } from "inversify-binding-decorators";
import { DatabaseAdaptersAvailable, IDatabaseAdapter } from "../DatabaseTypes";
import { FirebaseAdapter } from "./FirebaseAdapter"; // Import the new FirebaseAdapter
import { MongooseAdapter } from "./MongooseAdapter";

@provide(DatabaseFactory)
export class DatabaseFactory {
  constructor(
    private mongooseAdapter: MongooseAdapter,
    private firebaseAdapter: FirebaseAdapter // Inject the FirebaseAdapter
  ) {}

  public createDatabaseAdapter(databaseAdapter: DatabaseAdaptersAvailable): IDatabaseAdapter {
    switch (databaseAdapter) {
      case "mongoose":
        if (!appEnv.modules.mongodb) {
          throw new Error(
            "⚠️  MongoDB module is not enabled. Please set MODULE_MONGODB=true in your .env and run yarn module:build"
          );
        }

        return this.mongooseAdapter;
      case "firebase":
        if (appEnv.modules.mongodb) {
          throw new Error(
            "⚠️  MongoDB module is enabled while you're using FIREBASE adapter. Please set MODULE_MONGODB=false in your .env and run yarn module:build"
          );
        }

        return this.firebaseAdapter;
      default:
        throw new Error(`Database adapter ${databaseAdapter} not found`);
    }
  }
}
