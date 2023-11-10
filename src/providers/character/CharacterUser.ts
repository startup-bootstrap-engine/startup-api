import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IUser, User } from "@entities/ModuleSystem/UserModel";
import { provide } from "inversify-binding-decorators";
import mongoose from "mongoose";

@provide(CharacterUser)
export class CharacterUser {
  public async findUserByCharacter(character: ICharacter): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ characters: mongoose.Types.ObjectId(character._id) });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (err) {
      console.error(err);
    }
  }
}
