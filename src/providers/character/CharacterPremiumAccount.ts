import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { provide } from "inversify-binding-decorators";
import { CharacterUser } from "./CharacterUser";

@provide(CharacterPremiumAccount)
export class CharacterPremiumAccount {
  constructor(private characterUser: CharacterUser) {}

  public async isPremiumAccount(character: ICharacter): Promise<boolean> {
    const user = await this.characterUser.findUserByCharacter(character);

    if (!user) {
      return false;
    }

    return user.isPremiumAccount;
  }
}
