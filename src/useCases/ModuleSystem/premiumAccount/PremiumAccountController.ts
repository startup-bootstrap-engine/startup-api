import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { DTOValidatorMiddleware } from "@providers/middlewares/DTOValidatorMiddleware";
import { isAdminMiddleware } from "@providers/middlewares/IsAdminMiddleware";
import { PremiumAccountActivator } from "@providers/premiumAccount/PremiumAccountActivator";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { HttpStatus, UserAccountTypes } from "@startup-engine/shared";
import { controller, httpPost, interfaces, requestBody, response } from "inversify-express-utils";
import { PremiumAccountActivationDTO } from "./PremiumAccountActivationDTO";

@controller("/premium-account", AuthMiddleware(), isAdminMiddleware)
export class PremiumAccountController implements interfaces.Controller {
  constructor(
    private premiumAccountActivator: PremiumAccountActivator,
    private userRepository: UserRepository
  ) {}

  @httpPost("/activate", DTOValidatorMiddleware(PremiumAccountActivationDTO))
  public async activatePremiumAccount(
    @response() res,
    @requestBody() premiumAccountActivationDTO: PremiumAccountActivationDTO
  ): Promise<void> {
    const { email, accountType } = premiumAccountActivationDTO;

    const user = await this.userRepository.findBy({ email });

    if (!user) {
      return res.status(HttpStatus.BadRequest).send({ error: "User not found!" });
    }

    const result = await this.premiumAccountActivator.activateUserPremiumAccount(
      user,
      accountType as UserAccountTypes,
      {
        isManuallyControlledPremiumAccount: true,
      }
    );

    if (!result) {
      return res.status(HttpStatus.BadRequest).send({ error: "Error activating premium account!" });
    }

    return res.status(HttpStatus.OK).send({
      message: "Premium account activated successfully!",
    });
  }

  @httpPost("/deactivate")
  public async deactivatePremiumAccount(@response() res, @requestBody() body): Promise<void> {
    const { email } = body;

    if (!email) {
      return res.status(HttpStatus.BadRequest).send({ error: "Email is required" });
    }

    const user = await this.userRepository.findBy({ email });

    if (!user) {
      return res.status(HttpStatus.BadRequest).send({ error: "User not found!" });
    }

    const result = await this.premiumAccountActivator.deactivateUserPremiumAccount(user);

    if (!result) {
      return res.status(HttpStatus.BadRequest).send({ error: "Error deactivating premium account!" });
    }

    return res.status(HttpStatus.OK).send({
      message: "Premium account deactivated successfully!",
    });
  }
}
