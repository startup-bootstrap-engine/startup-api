import { ReferralBonusAwarder } from "@providers/referral/ReferralBonusAwarder";
import { ReferralBonusVerifier } from "@providers/referral/ReferralBonusVerifier";
import { Request } from "express";
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

  public async isReferralBonusAlreadyAdded(request: Request, deviceFingerprint: string): Promise<boolean> {
    return await this.referralBonusVerifier.isReferralBonusAlreadyAdded(request, deviceFingerprint);
  }
}
