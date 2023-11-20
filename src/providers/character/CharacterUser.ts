import { IUser, User } from "@entities/ModuleSystem/UserModel";
import { provide } from "inversify-binding-decorators";
import mongoose from "mongoose";

@provide(CharacterUser)
export class CharacterUser {
  public async findUserByCharacter(characterId: string): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ characters: mongoose.Types.ObjectId(characterId) }).cacheQuery({
        cacheKey: `character-${characterId}-user`,
        ttl: 60 * 60 * 24, // 24 hours
      });

      if (!user) {
        return;
      }

      return user;
    } catch (err) {
      console.error(err);
    }
  }
}
