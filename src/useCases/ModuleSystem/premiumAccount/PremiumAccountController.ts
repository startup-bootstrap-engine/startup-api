import { BadRequestError } from "@providers/errors/BadRequestError";
import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { isAdminMiddleware } from "@providers/middlewares/IsAdminMiddleware";
import { PremiumAccountActivator } from "@providers/premiumAccount/PremiumAccountActivator";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { controller, httpPost, interfaces, requestBody, response } from "inversify-express-utils";

@controller("/premium-account", AuthMiddleware(), isAdminMiddleware)
export class PremiumAccountController implements interfaces.Controller {
  constructor(
    private premiumAccountActivator: PremiumAccountActivator,
    private userRepository: UserRepository
  ) {}

  @httpPost("/activate")
  public async activatePremiumAccount(@response() res, @requestBody() body): Promise<void> {
    const { email, accountType } = body;

    const user = await this.userRepository.findBy({ email });

    if (!user) {
      throw new BadRequestError("User not found!");
    }

    const result = await this.premiumAccountActivator.activateUserPremiumAccount(user, accountType, {
      isManuallyControlledPremiumAccount: true,
    });

    if (!result) {
      throw new BadRequestError("Error activating premium account!");
    }

    return res.status(200).send({
      message: "Premium account activated successfully!",
    });
  }

  @httpPost("/deactivate")
  public async deactivatePremiumAccount(@response() res, @requestBody() body): Promise<void> {
    const { email } = body;

    const user = await this.userRepository.findBy({ email });

    if (!user) {
      throw new BadRequestError("User not found!");
    }

    const result = await this.premiumAccountActivator.deactivateUserPremiumAccount(user);

    if (!result) {
      throw new BadRequestError("Error deactivating premium account!");
    }

    return res.status(200).send({
      message: "Premium account deactivated successfully!",
    });
  }
}
