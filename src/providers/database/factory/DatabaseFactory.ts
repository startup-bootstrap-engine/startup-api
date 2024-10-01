import { provide } from "inversify-binding-decorators";
import { DatabaseAdaptersAvailable, IDatabaseAdapter } from "../DatabaseTypes";
import { MongooseAdapter } from "./MongooseAdapter";

@provide(DatabaseFactory)
export class DatabaseFactory {
  constructor(private mongooseAdapter: MongooseAdapter) {}

  public createDatabaseAdapter(databaseAdapter: DatabaseAdaptersAvailable): IDatabaseAdapter {
    switch (databaseAdapter) {
      case "mongoose":
        return this.mongooseAdapter;
      default:
        throw new Error(`Database adapter ${databaseAdapter} not found`);
    }
  }
}
