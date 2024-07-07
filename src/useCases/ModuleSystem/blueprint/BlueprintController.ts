/* eslint-disable no-unused-vars */
import { controller, httpGet, interfaces, requestParam } from "inversify-express-utils";
import { BlueprintNamespaces } from "../../../providers/blueprint/BlueprintManager";
import { BlueprintUseCase } from "./BlueprintUseCase";

@controller("/blueprints")
export class BlueprintController implements interfaces.Controller {
  constructor(private BlueprintUseCase: BlueprintUseCase) {}

  @httpGet("/:namespace")
  private async getBlueprintKey(@requestParam("namespace") namespace: BlueprintNamespaces): Promise<any> {
    return await this.BlueprintUseCase.getBluePrintsValues(namespace);
  }
}
