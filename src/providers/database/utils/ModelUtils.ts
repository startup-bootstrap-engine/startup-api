import { provide } from "inversify-binding-decorators";
import pluralize from "pluralize";

@provide(ModelUtils)
export class ModelUtils {
  public getModelNamePluralized(modelName: string): string {
    return pluralize(modelName.toLowerCase());
  }
}
