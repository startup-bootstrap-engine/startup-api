import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IUser, User } from "@entities/ModuleSystem/UserModel";
import { provide } from "inversify-binding-decorators";

@provide(CharacterUser)
export class CharacterUser {
  public async findUserByCharacter(character: ICharacter): Promise<IUser | undefined> {
    try {
      // eslint-disable-next-line mongoose-lean/require-lean
      const user = await User.findOne({ _id: character.owner });

      if (!user) {
        return;
      }

      return user;
    } catch (err) {
      console.error(err);
    }
  }
}
