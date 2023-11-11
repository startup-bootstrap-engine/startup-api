import { IPremiumAccountRatio, PREMIUM_ACCOUNT_TYPES_RATIOS } from "@providers/constants/PremiumAccountConstants";
import { provide } from "inversify-binding-decorators";
import { CharacterUser } from "./CharacterUser";
@provide(CharacterPremiumAccount)
export class CharacterPremiumAccount {
  constructor(private characterUser: CharacterUser) {}

  public async getPremiumAccountData(characterId: string): Promise<IPremiumAccountRatio | undefined> {
    const user = await this.characterUser.findUserByCharacter(characterId);

    if (!user || !user.accountType) {
      return undefined;
    }

    return PREMIUM_ACCOUNT_TYPES_RATIOS[user.accountType];
  }
}
