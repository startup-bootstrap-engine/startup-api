import { IUser, User } from "@entities/ModuleSystem/UserModel";
import { provide } from "inversify-binding-decorators";
import mongoose from "mongoose";

@provide(CharacterUser)
export class CharacterUser {
  public async findUserByCharacter(characterId: string): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ characters: mongoose.Types.ObjectId(characterId) }).cacheQuery({
        cacheKey: `character-${characterId}-user`,
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (err) {
      console.error(err);
    }
  }
}
