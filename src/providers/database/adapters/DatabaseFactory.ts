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
        return this.mongooseAdapter;
      case "firebase":
        return this.firebaseAdapter;
      default:
        throw new Error(`Database adapter ${databaseAdapter} not found`);
    }
  }
}
