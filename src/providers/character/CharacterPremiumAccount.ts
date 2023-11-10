import { provide } from "inversify-binding-decorators";
import { CharacterUser } from "./CharacterUser";

@provide(CharacterPremiumAccount)
export class CharacterPremiumAccount {
  constructor(private characterUser: CharacterUser) {}

  public async isPremiumAccount(characterId: string): Promise<boolean> {
    const user = await this.characterUser.findUserByCharacter(characterId);

    if (!user) {
      return false;
    }

    return user.isPremiumAccount;
  }
}
