import { IPremiumAccountData, PREMIUM_ACCOUNT_METADATA } from "@providers/constants/PremiumAccountConstants";
import { provide } from "inversify-binding-decorators";
import { CharacterUser } from "./CharacterUser";
@provide(CharacterPremiumAccount)
export class CharacterPremiumAccount {
  constructor(private characterUser: CharacterUser) {}

  public async getPremiumAccountData(characterId: string): Promise<IPremiumAccountData | undefined> {
    const user = await this.characterUser.findUserByCharacter(characterId);

    if (!user || !user.accountType) {
      return;
    }

    return PREMIUM_ACCOUNT_METADATA[user.accountType];
  }
}
