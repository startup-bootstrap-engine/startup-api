// src/entities/ModuleSystem/UserModel.ts

import { IABTest } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";
import { ZodType } from "zod";
import { BaseModel } from "./abstraction/BaseModel";

@provide(ABTestModel)
export class ABTestModel extends BaseModel<ZodType<IABTest>> {
  protected get modelName(): string {
    return "ABTest";
  }
}
