import { appEnv } from "@providers/config/env";
import { provide } from "inversify-binding-decorators";
import { Model } from "mongoose";
import pluralize from "pluralize";
import { FirebaseAdapter } from "../adapters/FirebaseAdapter";
import { DatabaseAdaptersAvailable, IRepositoryAdapter } from "../DatabaseTypes";
import { FirebaseRepository } from "./FirebaseRepository";
import { MongooseRepository } from "./MongooseRepository";

@provide(RepositoryFactory)
export class RepositoryFactory {
  constructor(private firebaseAdapter: FirebaseAdapter) {}

  public createRepository<T extends { [key: string]: any }>(
    model: Model<any>,
    type: DatabaseAdaptersAvailable = appEnv.database.DB_ADAPTER as DatabaseAdaptersAvailable
  ): IRepositoryAdapter<T> {
    const modelName = pluralize(model.modelName.toLowerCase());

    switch (type) {
      case "mongoose":
        return new MongooseRepository(model);
      case "firebase":
        const firebaseRepository = new FirebaseRepository(this.firebaseAdapter);
        firebaseRepository.init(modelName);

        return firebaseRepository as unknown as IRepositoryAdapter<T>;
      default:
        throw new Error(`Repository type ${type} is not supported`);
    }
  }
}
