import { appEnv } from "@providers/config/env";
import { provide } from "inversify-binding-decorators";
import { DatabaseAdaptersAvailable } from "./DatabaseTypes";

@provide(DatabaseAdaptersInfo)
export class DatabaseAdaptersInfo {
  public getCurrentDatabaseAdapter(): DatabaseAdaptersAvailable {
    if (appEnv.modules.mongodb) {
      return "mongoose";
    }

    if (appEnv.modules.postgreSQL) {
      return "prisma";
    }

    if (appEnv.modules.firebase) {
      return "firebase";
    }

    throw new Error("No database adapter found");
  }
}
