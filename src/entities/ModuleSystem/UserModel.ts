// src/entities/ModuleSystem/UserModel.ts

import { appEnv } from "@providers/config/env";
import { DatabaseAdaptersAvailable } from "@providers/database/DatabaseTypes";
import { provide } from "inversify-binding-decorators";
import { ObjectSchema } from "joi";
import { createMongooseModel } from "../schemaUtils";
import { IAgnosticSchema } from "./schemas/schemaTypes";
import { IUser, userSchema } from "./schemas/userSchema";

@provide(UserModel)
export class UserModel implements IAgnosticSchema {
  constructor() {}

  /**
   * Initializes and validates user data.
   * @param schema Partial user data input.
   * @returns Validated and processed user data.
   * @throws ValidationError if validation fails.
   */
  public initializeData(
    schema: ObjectSchema<IUser>,
    adapter = appEnv.database.DB_ADAPTER as DatabaseAdaptersAvailable
  ): any {
    // Changed return type to `any` for flexibility
    switch (adapter) {
      case "mongoose":
        const mongooseModel = createMongooseModel("User", userSchema);
        return mongooseModel;
      case "firebase":
        return "users"; // Return collection name as a string
      default:
        throw new Error(`Adapter type ${adapter} is not supported`);
    }
  }
}
