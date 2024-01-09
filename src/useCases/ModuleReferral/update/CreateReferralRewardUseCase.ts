import { ReferralBonusAwarder } from "@providers/referral/ReferralBonusAwarder";
import { ReferralBonusVerifier } from "@providers/referral/ReferralBonusVerifier";
import { provide } from "inversify-binding-decorators";
@provide(CreateReferralRewardUseCase)
export class CreateReferralRewardUseCase {
  constructor(
    private referralBonusAwarder: ReferralBonusAwarder,
    private referralBonusVerifier: ReferralBonusVerifier
  ) {}

  public awardReferralBonusToCharacter(characterId: string, amount: number): Promise<void> {
    return this.referralBonusAwarder.awardReferralBonusToCharacter(characterId, amount);
  }

  public async wasReferralBonusAlreadyAdded(deviceFingerprint: string): Promise<boolean> {
    return await this.referralBonusVerifier.wasReferralBonusAlreadyAdded(deviceFingerprint);
  }

  public async wasReferralBonusAlreadyAddedToday(deviceFingerprint: string): Promise<boolean> {
    return await this.referralBonusVerifier.wasReferralBonusAlreadyAddedToday(deviceFingerprint);
  }
}
