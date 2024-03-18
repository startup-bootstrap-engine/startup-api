import { cache } from "@providers/constants/CacheConstants";
import { NoCacheMiddleware } from "@providers/middlewares/NoCacheControlMiddleware";
import { controller, httpGet, interfaces, requestParam } from "inversify-express-utils";
import { GetMapMetadataUseCase } from "./GetMapMetadataUseCase";

@controller("/maps")
export class MapController implements interfaces.Controller {
  constructor(private getMapMetadata: GetMapMetadataUseCase) {}

  @httpGet("/:mapName/metadata", NoCacheMiddleware, cache("24 hours"))
  public mapMetadata(@requestParam() params): object {
    return this.getMapMetadata.execute(params.mapName);
  }
}
