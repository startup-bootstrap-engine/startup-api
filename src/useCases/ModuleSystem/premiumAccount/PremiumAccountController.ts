import { IUser, User } from "@entities/ModuleSystem/UserModel";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { isAdminMiddleware } from "@providers/middlewares/IsAdminMiddleware";
import { PremiumAccountActivator } from "@providers/premiumAccount/PremiumAccountActivator";
import { controller, httpPost, interfaces, requestBody, response } from "inversify-express-utils";
import { PremiumAccountUseCase } from "./PremiumAccountUseCase";

@controller("/premium-account", AuthMiddleware, isAdminMiddleware)
export class PremiumAccountController implements interfaces.Controller {
  constructor(
    private premiumAccountUseCase: PremiumAccountUseCase,
    private inMemoryHashTable: InMemoryHashTable,
    private premiumAccountActivator: PremiumAccountActivator
  ) {}

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

  @httpPost("/activate")
  public async activatePremiumAccount(@response() res, @requestBody() body): Promise<void> {
    const { email, accountType } = body;

    const user = (await User.findOne({ email: email }).lean()) as IUser;

    if (!user) {
      return res.status(400).send({
        message: "User not found!",
      });
    }

    await this.premiumAccountActivator.activateUserPremiumAccount(user, accountType, {
      isManuallyControlledPremiumAccount: true,
    });

    return res.status(200).send({
      message: "Premium account activated successfully!",
    });
  }

  @httpPost("/deactivate")
  public async deactivatePremiumAccount(@response() res, @requestBody() body): Promise<void> {
    const { email } = body;

    const user = (await User.findOne({ email: email }).lean()) as IUser;

    if (!user) {
      new BadRequestError("User not found!");
    }

    const result = await this.premiumAccountActivator.deactivateUserPremiumAccount(user);

    if (!result) {
      new BadRequestError("Error deactivating premium account!");
    }

    return res.status(200).send({
      message: "Premium account deactivated successfully!",
    });
  }
}
