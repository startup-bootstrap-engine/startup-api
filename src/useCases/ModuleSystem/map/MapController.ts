import { controller, httpGet, interfaces, requestParam } from "inversify-express-utils";
import { GetMapMetadataUseCase } from "./GetMapMetadataUseCase";

@controller("/maps")
export class MapController implements interfaces.Controller {
  constructor(private getMapMetadata: GetMapMetadataUseCase) {}

  @httpGet("/:mapName/metadata")
  public mapMetadata(@requestParam() params): object {
    return this.getMapMetadata.execute(params.mapName);
  }
}
