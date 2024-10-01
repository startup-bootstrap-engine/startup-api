import { provide } from "inversify-binding-decorators";

import { Document, Model } from "mongoose";
import { DatabaseAdaptersAvailable, IRepositoryAdapter } from "../DatabaseTypes";
import { MongooseRepository } from "./MongooseRepository";

@provide(RepositoryFactory)
export class RepositoryFactory {
  public static createRepository<T extends Document>(
    model: Model<any>,
    type: DatabaseAdaptersAvailable = "mongoose"
  ): IRepositoryAdapter<T> | IRepositoryAdapter<any> {
    switch (type) {
      case "mongoose":
        return new MongooseRepository<T>(model);

      default:
        throw new Error(`Repository type ${type} is not supported`);
    }
  }
}
