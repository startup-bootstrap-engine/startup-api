// src/entities/ModuleSystem/UserModel.ts

import { IUserPreferences } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";
import { ZodType } from "zod";
import { BaseModel } from "./abstraction/BaseModel";

@provide(UserPreferenceModel)
export class UserPreferenceModel extends BaseModel<ZodType<IUserPreferences>> {
  protected get modelName(): string {
    return "UserPreference";
  }
}
