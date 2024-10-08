import { appEnv } from "@providers/config/env";
import { provide } from "inversify-binding-decorators";
import { Model } from "mongoose";
import { ZodObject } from "zod";
import { DatabaseAdaptersAvailable, IRepositoryAdapter } from "../DatabaseTypes";
import { FirebaseRepository } from "./FirebaseRepository";
import { MongooseRepository } from "./MongooseRepository";

@provide(RepositoryFactory)
export class RepositoryFactory {
  constructor(private firebaseRepository: FirebaseRepository<any>) {}

  public createRepository<T extends { [key: string]: any }>(
    model: Model<any> | string,
    schema: ZodObject<any>,
    type: DatabaseAdaptersAvailable = appEnv.database.DB_ADAPTER as DatabaseAdaptersAvailable
  ): IRepositoryAdapter<T> {
    switch (type) {
      case "mongoose":
        return new MongooseRepository(model as Model<any>);
      case "firebase":
        // Ensure model is a string for Firebase
        this.firebaseRepository.init(model as string, schema);
        return this.firebaseRepository;

      default:
        throw new Error(`Repository type ${type} is not supported`);
    }
  }
}
