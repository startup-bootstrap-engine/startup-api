import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { isAdminMiddleware } from "@providers/middlewares/IsAdminMiddleware";
import { controller, httpGet, interfaces, requestParam, response } from "inversify-express-utils";
import { ScriptsUseCase } from "./ScriptsUseCase";

@controller("/scripts", AuthMiddleware, isAdminMiddleware)
export class ScriptsController implements interfaces.Controller {
  constructor(private scriptsUseCase: ScriptsUseCase) {}

  @httpGet("/reports/items")
  public async generateReportItems(@response() res): Promise<void> {
    await this.scriptsUseCase.generateReportItems();

    return res.status(200).send({
      message: "Report generated!",
    });
  }

  @httpGet("/cleanup/items")
  public async cleanupItems(@response() res): Promise<void> {
    await this.scriptsUseCase.cleanupItems();

    return res.status(200).send({
      message: "Items cleaned up!",
    });
  }

  @httpGet("/cleanup/redis/:namespace")
  public async cleanupRedis(@response() res, @requestParam("namespace") namespace: string): Promise<void> {
    await this.scriptsUseCase.cleanupRedis(namespace);

    return res.status(200).send({
      message: "Redis blueprints cleaned up!",
    });
  }

  @httpGet("/adjust-speed")
  public async adjustSpeed(@response() res): Promise<void> {
    await this.scriptsUseCase.setAllBaseSpeedsToStandard();

    return res.status(200).send({
      message: "Speed adjusted",
    });
  }

  @httpGet("/clean-marketplace")
  public async cleanMarketplace(@response() res): Promise<void> {
    await this.scriptsUseCase.marketplaceClean();

    return res.status(200).send({
      message: "Marketplace cleaned!",
    });
  }

  @httpGet("/initial-coordinates")
  public async initialCoordinates(@response() res): Promise<void> {
    // update all initial coordinates from users performatically

    await this.scriptsUseCase.adjustInitialCoordinates();

    return res.status(200).send({
      message: "Initial coordinates adjusted succesfully",
    });
  }

  @httpGet("/cleanup-character-user-cache/:characterId")
  public async cleanupCharacterUserCache(
    @response() res,
    @requestParam("characterId") characterId: string
  ): Promise<void> {
    await this.scriptsUseCase.cleanupCharacterUserCache(characterId);

    return res.status(200).send({
      message: "Character user cache cleaned up!",
    });
  }

  @httpGet("/update-items-min-requirements")
  public async updateItemsMinRequirements(@response() res): Promise<void> {
    await this.scriptsUseCase.updateItemMinRequirementsToMatchBlueprint();

    return res.status(200).send({
      message: "Items min requirements updated!",
    });
  }

  @httpGet("/update-farming-skills")
  public async updateFarmingSkills(@response() res): Promise<void> {
    await this.scriptsUseCase.UpdateFarmingSkills();

    return res.status(200).send({
      message: "Farming skills updated!",
    });
  }

  @httpGet("/fix-depot-ownership")
  public async fixDepotOwnership(@response() res): Promise<void> {
    await this.scriptsUseCase.fixDepotOwnership();

    return res.status(200).send({
      message: "Depot ownership fixed!",
    });
  }

  @httpGet("/users-emails-dump")
  public async dumpUserEmailsOnTxt(@response() res): Promise<void> {
    await this.scriptsUseCase.dumpUserEmailsOnCsv();

    return res.status(200).send({
      message: "Emails dumped!",
    });
  }

  @httpGet("/farmland-depot-fix")
  public async farmlandDepotFix(@response() res): Promise<void> {
    await this.scriptsUseCase.farmlandDepotFix();

    return res.status(200).send({
      message: "Depots fixed!",
    });
  }
}
