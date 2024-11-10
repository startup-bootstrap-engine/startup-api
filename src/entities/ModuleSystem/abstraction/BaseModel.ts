import { DatabaseAdaptersAvailable } from "@providers/database/DatabaseTypes";
import { databaseAdaptersInfo } from "@providers/inversify/container";
import { provide } from "inversify-binding-decorators";
import pluralize from "pluralize";
import { z, ZodSchema } from "zod";
import { createMongooseModel, zodToObject } from "zod-to-schema";
import { IAgnosticSchema } from "../schemas/schemaTypes";

@provide(BaseModel)
export abstract class BaseModel<T extends z.ZodTypeAny> implements IAgnosticSchema {
  /**
   * Initializes and validates data.
   * @param schema Zod schema for the model.
   * @param data Optional initial data for the model.
   * @param adapter Optional adapter type.
   * @returns Validated and processed data or model.
   * @throws Error if adapter is not supported or if data validation fails.
   */
  public initializeData(
    schema: ZodSchema,
    data?: Partial<z.infer<T>>,

    adapter: DatabaseAdaptersAvailable = databaseAdaptersInfo.getCurrentDatabaseAdapter()
  ): any {
    switch (adapter) {
      case "mongoose":
        const Model = createMongooseModel(this.modelName, schema as z.ZodObject<any>);
        if (data) {
          const validatedData = zodToObject(schema, data);
          return new Model(validatedData);
        }
        return Model;
      case "firebase":
        return this.collectionName; // Return collection name as a string
      case "prisma":
        return this.modelName;
      default:
        throw new Error(`Adapter type ${adapter} is not supported`);
    }
  }

  protected abstract get modelName(): string;

  protected get collectionName(): string {
    return pluralize(this.modelName).toLowerCase();
  }
}
