// src/models/UserModel.ts
import { appEnv } from "@providers/config/env";
import { DatabaseAdaptersAvailable } from "@providers/database/DatabaseTypes";
import { provide } from "inversify-binding-decorators";
import { createMongooseModel } from "./mongoose/createMongooseModel";
import { IAgnosticSchema } from "./schemas/schemaTypes";
import { IUser, userSchema } from "./schemas/userSchema";

@provide(UserModel)
export class UserModel implements IAgnosticSchema {
  private adapter: string;

  /**
   * Initializes and validates user data.
   * @param userData Partial user data input.
   * @returns Validated and processed user data.
   * @throws ValidationError if validation fails.
   */
  public initializeData(userData, adapter = appEnv.database.DB_ADAPTER as DatabaseAdaptersAvailable): IUser {
    switch (adapter) {
      case "mongoose":
        const mongooseModel = createMongooseModel("User", userSchema);

        return mongooseModel as unknown as IUser;
      case "firebase":
        return userData as IUser;
      default:
        throw new Error(`Adapter type ${adapter} is not supported`);
    }
  }
}
