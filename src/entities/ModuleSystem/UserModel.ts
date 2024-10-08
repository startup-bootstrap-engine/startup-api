// src/entities/ModuleSystem/UserModel.ts

import { IUser } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";
import { ZodType } from "zod";
import { BaseModel } from "./abstraction/BaseModel";

@provide(UserModel)
export class UserModel extends BaseModel<ZodType<IUser>> {
  protected get modelName(): string {
    return "User";
  }
}
