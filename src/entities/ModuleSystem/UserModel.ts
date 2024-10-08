// src/entities/ModuleSystem/UserModel.ts

import { provide } from "inversify-binding-decorators";
import { ZodType } from "zod";
import { BaseModel } from "./abstraction/BaseModel";
import { IUser } from "./schemas/userSchema";

@provide(UserModel)
export class UserModel extends BaseModel<ZodType<IUser>> {
  protected get modelName(): string {
    return "User";
  }
}
