import { ILog } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";
import { ZodType } from "zod";
import { BaseModel } from "./abstraction/BaseModel";

@provide(LogModel)
export class LogModel extends BaseModel<ZodType<ILog>> {
  protected get modelName(): string {
    return "Log";
  }
}
