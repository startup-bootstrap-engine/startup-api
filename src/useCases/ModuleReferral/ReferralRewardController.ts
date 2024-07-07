import { INPC } from "@entities/ModuleNPC/NPCModel";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { HttpStatus } from "@rpg-engine/shared";
import { Response } from "express";
import rateLimit from "express-rate-limit";
// eslint-disable-next-line no-unused-vars
import { controller, httpPost, interfaces, request, requestBody, response } from "inversify-express-utils";
import { CreateReferralRewardDTO } from "./update/CreateReferralRewardDTO";
import { CreateReferralRewardUseCase } from "./update/CreateReferralRewardUseCase";

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

@controller("/referral")
export class ReferralRewardController implements interfaces.Controller {
  constructor(private createReferralRewardUseCase: CreateReferralRewardUseCase) {}

  @httpPost("/", rateLimiter)
  private async addReferralBonus(
    @requestBody() body: CreateReferralRewardDTO,
    @response() response,
    @request() request
  ): Promise<INPC> {
    try {
      const { characterId, deviceFingerprint } = body;

      if (!characterId) {
        throw new BadRequestError("CharacterId field is required.");
      }

      const isReferralBonusAlreadyAdded = await this.createReferralRewardUseCase.wasReferralBonusAlreadyAdded(
        String(deviceFingerprint)!
      );

      if (isReferralBonusAlreadyAdded) {
        console.log(`Character ${characterId} is trying to add a referral bonus, but failed.`);

        return response.status(HttpStatus.OK).json({ message: "Referral bonus already added." });
      }

      console.log("✨ Adding referral bonus to character: ", characterId);

      await this.createReferralRewardUseCase.awardReferralBonusToCharacter(characterId, 10);

      return response.status(HttpStatus.OK).json({ message: "Referral bonus added." });
    } catch (error) {
      console.error(error);

      throw new BadRequestError("Error while trying to add referral bonus.");
    }
  }

  @httpPost("/add-daily-reward", rateLimiter)
  private addDailyReward(
    @requestBody() body: CreateReferralRewardDTO,
    @response() response,
    @request() request
  ): Promise<Response<any>> {
    return response.status(HttpStatus.OK).json({ message: "Referral system is disabled." });
    // try {
    //   const { characterId, deviceFingerprint } = body;
    //   if (!characterId) {
    //     throw new BadRequestError("CharacterId field is required.");
    //   }
    //   const isReferralBonusAlreadyAddedToday = await this.createReferralRewardUseCase.wasReferralBonusAlreadyAddedToday(
    //     String(deviceFingerprint)!
    //   );
    //   if (isReferralBonusAlreadyAddedToday) {
    //     console.log(`Character ${characterId} is trying to add a referral bonus TODAY, but failed.`);
    //     return response.status(HttpStatus.OK).json({ message: "Failed to add daily referral bonus." });
    //   }
    //   console.log("✨ Adding daily referral bonus to character: ", characterId);
    //   const n = random(1, 100);
    //   if (n <= CRAFTING_SOCIAL_CRYSTAL_DAILY_REWARD_CHANCE) {
    //     await this.createReferralRewardUseCase.awardReferralBonusToCharacter(characterId, 1);
    //     return response.status(HttpStatus.OK).json({ message: "Daily referral bonus added." });
    //   } else {
    //     return response.status(HttpStatus.OK).json({ message: "Failed to add daily referral bonus." });
    //   }
    // } catch (error) {
    //   console.error(error);
    //   throw new BadRequestError("Error while trying to add referral bonus.");
    // }
  }
}
