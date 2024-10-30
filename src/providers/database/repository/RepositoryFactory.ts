import { appEnv } from "@providers/config/env";
import { provide } from "inversify-binding-decorators";
import { Model } from "mongoose";
import { ZodObject } from "zod";
import { DatabaseAdaptersAvailable, IRepositoryAdapter } from "../DatabaseTypes";
import { FirebaseRepository } from "./FirebaseRepository";
import { MongooseRepository } from "./MongooseRepository";
import { PrismaModelName, PrismaRepository } from "./PrismaRepository";

@provide(RepositoryFactory)
export class RepositoryFactory {
  constructor(private firebaseRepository: FirebaseRepository<any>, private prismaRepository: PrismaRepository<any>) {}

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
        void this.firebaseRepository.init(model as string, schema);
        return this.firebaseRepository;

      case "prisma":
        void this.prismaRepository.init(model as PrismaModelName, schema);
        return this.prismaRepository;

      default:
        throw new Error(`Repository type ${type} is not supported`);
    }
  }
}
