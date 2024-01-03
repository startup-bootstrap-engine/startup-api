import { INPC } from "@entities/ModuleNPC/NPCModel";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { HttpStatus } from "@rpg-engine/shared";
import { controller, httpPost, interfaces, request, requestBody, response } from "inversify-express-utils";
import { CreateReferralRewardDTO } from "./update/CreateReferralRewardDTO";
import { CreateReferralRewardUseCase } from "./update/CreateReferralRewardUseCase";

@controller("/referral")
export class ReferralRewardController implements interfaces.Controller {
  constructor(
    private createReferralRewardUseCase: CreateReferralRewardUseCase,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  @httpPost("/")
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

      const isReferralBonusAlreadyAdded = await this.createReferralRewardUseCase.isReferralBonusAlreadyAdded(
        request,
        deviceFingerprint!
      );

      if (isReferralBonusAlreadyAdded) {
        console.log(`Character ${characterId} is trying to add a referral bonus, but failed.`);

        return response.status(HttpStatus.OK).json({ message: "Referral bonus already added." });
      }

      await this.createReferralRewardUseCase.awardReferralBonusToCharacter(characterId, 1);

      return response.status(HttpStatus.OK).json({ message: "Referral bonus added." });
    } catch (error) {
      console.error(error);

      throw new BadRequestError("Error while trying to add referral bonus.");
    }
  }
}
