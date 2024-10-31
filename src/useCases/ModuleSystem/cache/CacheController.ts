import { cache } from "@providers/constants/CacheConstants";
import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { isAdminMiddleware } from "@providers/middlewares/IsAdminMiddleware";
import { controller, httpGet, interfaces, request } from "inversify-express-utils";

@controller("/cache", AuthMiddleware(), isAdminMiddleware)
export class CacheController implements interfaces.Controller {
  @httpGet("/purge")
  public purge(@request() req): object {
    cache.clear();

    return { message: "Cache purged" };
  }
}
