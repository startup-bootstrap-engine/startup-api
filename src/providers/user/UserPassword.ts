import { IUser } from "@startup-engine/shared";
import { AuthSignUpDTO } from "@useCases/ModuleSystem/user/AuthDTO";
import bcrypt from "bcrypt";
import { provide } from "inversify-binding-decorators";

@provide(UserPassword)
export class UserPassword {
  public async generatePasswordHash(authSignUpDTO: AuthSignUpDTO): Promise<IUser> {
    const salt = await bcrypt.genSalt();

    const hash = await bcrypt.hash(authSignUpDTO.password, salt);

    const user = {
      ...authSignUpDTO,
      password: hash,
      salt,
    } as unknown as IUser;

    return user;
  }
}
