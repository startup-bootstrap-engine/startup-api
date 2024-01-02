import { INPC } from "@entities/ModuleNPC/NPCModel";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { HttpStatus } from "@rpg-engine/shared";
import { controller, httpPost, interfaces, requestBody, response } from "inversify-express-utils";
import { CreateReferralRewardDTO } from "./update/CreateReferralRewardDTO";
import { CreateReferralRewardUseCase } from "./update/CreateReferralRewardUseCase";

@controller("/referral")
export class ReferralRewardController implements interfaces.Controller {
  constructor(private createReferralRewardUseCase: CreateReferralRewardUseCase) {}

  @httpPost("/")
  private async addReferralBonus(@requestBody() body: CreateReferralRewardDTO, @response() response): Promise<INPC> {
    try {
      const characterId = body.characterId;

      if (!characterId) {
        throw new BadRequestError("CharacterId field is required.");
      }

      await this.createReferralRewardUseCase.awardReferralBonusToCharacter(characterId, 1);

      return response.status(HttpStatus.OK).json({ message: "Referral bonus added." });
    } catch (error) {
      console.error(error);

      throw new BadRequestError("Error while trying to add referral bonus.");
    }
  }
}
