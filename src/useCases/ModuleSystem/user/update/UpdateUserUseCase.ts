import { IUser } from "@entities/ModuleSystem/UserModel";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { provide } from "inversify-binding-decorators";

import { UserUpdateDTO } from "../UserDTO";

@provide(UpdateUserUseCase)
export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  public async update(user: IUser, updateFields: UserUpdateDTO): Promise<IUser> {
    return (await this.userRepository.update(user._id, updateFields as unknown as Partial<IUser>)) as IUser;
  }
}
