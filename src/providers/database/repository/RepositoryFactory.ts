import { appEnv } from "@providers/config/env";
import { provide } from "inversify-binding-decorators";
import { ObjectSchema } from "joi";
import { DatabaseAdaptersAvailable, IRepositoryAdapter } from "../DatabaseTypes";
import { FirebaseRepository } from "./FirebaseRepository";
import { MongooseRepository } from "./MongooseRepository";

@provide(RepositoryFactory)
export class RepositoryFactory {
  constructor(private firebaseRepository: FirebaseRepository<any>) {}

  public createRepository<T extends { [key: string]: any }>(
    model: any,
    schema: ObjectSchema,
    type: DatabaseAdaptersAvailable = appEnv.database.DB_ADAPTER as DatabaseAdaptersAvailable
  ): IRepositoryAdapter<T> {
    switch (type) {
      case "mongoose":
        return new MongooseRepository(model) as unknown as IRepositoryAdapter<T>;
      case "firebase":
        // Ensure model is a string for Firebase
        this.firebaseRepository.init(model, schema);
        return this.firebaseRepository;

      default:
        throw new Error(`Repository type ${type} is not supported`);
    }
  }
}
