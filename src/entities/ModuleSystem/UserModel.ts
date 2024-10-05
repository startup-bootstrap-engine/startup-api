// src/entities/ModuleSystem/UserModel.ts

import { provide } from "inversify-binding-decorators";
import { BaseModel } from "./abstraction/BaseModel";
import { IUser } from "./schemas/userSchema";

@provide(UserModel)
export class UserModel extends BaseModel<IUser> {
  protected get modelName(): string {
    return "User";
  }
}
