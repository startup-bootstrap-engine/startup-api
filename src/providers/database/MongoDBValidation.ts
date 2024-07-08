import { provide } from "inversify-binding-decorators";
import mongoose from "mongoose";

@provide(MongoDBValidation)
export class MongoDBValidation {
  public isValidObjectId(id: string): boolean {
    // @ts-ignore
    return mongoose.Types.ObjectId.isValid(id);
  }
}
