import { appEnv } from "@providers/config/env";
import { provide } from "inversify-binding-decorators";
import { Model } from "mongoose";
import { DatabaseAdaptersAvailable, IRepositoryAdapter } from "../DatabaseTypes";
import { FirebaseRepository } from "./FirebaseRepository";
import { MongooseRepository } from "./MongooseRepository";

@provide(RepositoryFactory)
export class RepositoryFactory {
  constructor(private firebaseRepository: FirebaseRepository<any>) {}

  public createRepository<T extends { [key: string]: any }>(
    model: Model<any>,
    type: DatabaseAdaptersAvailable = appEnv.database.DB_ADAPTER as DatabaseAdaptersAvailable
  ): IRepositoryAdapter<T> {
    switch (type) {
      case "mongoose":
        return new MongooseRepository(model);
      case "firebase":
        this.firebaseRepository.init(model);

        return this.firebaseRepository as unknown as IRepositoryAdapter<T>;
      default:
        throw new Error(`Repository type ${type} is not supported`);
    }
  }
}
