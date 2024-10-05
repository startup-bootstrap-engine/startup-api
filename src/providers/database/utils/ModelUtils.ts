import { provide } from "inversify-binding-decorators";
import { Model } from "mongoose";
import pluralize from "pluralize";

@provide(ModelUtils)
export class ModelUtils {
  public getModelNamePluralized(model: Model<any>): string {
    return pluralize(model.modelName.toLowerCase());
  }
}
