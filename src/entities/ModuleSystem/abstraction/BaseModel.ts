import { createMongooseModel } from "@entities/schemaUtils";
import { appEnv } from "@providers/config/env";
import { DatabaseAdaptersAvailable } from "@providers/database/DatabaseTypes";
import { provide } from "inversify-binding-decorators";
import pluralize from "pluralize";
import { z, ZodSchema } from "zod";
import { IAgnosticSchema } from "../schemas/schemaTypes";

@provide(BaseModel)
export abstract class BaseModel<T extends z.ZodTypeAny> implements IAgnosticSchema {
  /**
   * Initializes and validates data.
   * @param schema Partial data input.
   * @param adapter Optional adapter type.
   * @returns Validated and processed data.
   * @throws Error if adapter is not supported.
   */
  public initializeData(
    schema: ZodSchema,
    adapter: DatabaseAdaptersAvailable = appEnv.database.DB_ADAPTER as DatabaseAdaptersAvailable
  ): any {
    switch (adapter) {
      case "mongoose":
        return createMongooseModel(this.modelName, schema.parse({}));
      case "firebase":
        return this.collectionName; // Return collection name as a string
      default:
        throw new Error(`Adapter type ${adapter} is not supported`);
    }
  }

  protected abstract get modelName(): string;

  protected get collectionName(): string {
    // Implemented in BaseModel
    return pluralize(this.modelName).toLowerCase();
  }
}
