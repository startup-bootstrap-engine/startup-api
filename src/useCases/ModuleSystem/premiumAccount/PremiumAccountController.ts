import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { isAdminMiddleware } from "@providers/middlewares/IsAdminMiddleware";
import { controller, httpPost, interfaces, requestBody, response } from "inversify-express-utils";
import { PremiumAccountUseCase } from "./PremiumAccountUseCase";

@controller("/premium-account", AuthMiddleware, isAdminMiddleware)
export class PremiumAccountController implements interfaces.Controller {
  constructor(private premiumAccountUseCase: PremiumAccountUseCase, private inMemoryHashTable: InMemoryHashTable) {}

  @httpPost("/create-item")
  public async createItem(@response() res, @requestBody() body): Promise<void> {
    const { blueprintKey, characterId, quantity } = body;

    await this.premiumAccountUseCase.createItemToCharacter(blueprintKey, characterId, quantity);

    return res.status(200).send({
      message: "Item generated successfully!",
    });
  }

  @httpPost("/create-extra-depot-slots")
  public async createExtraDepotSlots(@response() res, @requestBody() body): Promise<void> {
    const { characterId, depotCity, slotQtyToAdd } = body;

    await this.premiumAccountUseCase.createExtraDepotSlots(characterId, depotCity, slotQtyToAdd);

    return res.status(200).send({
      message: "Depot slots generated successfully!",
    });
  }
}
