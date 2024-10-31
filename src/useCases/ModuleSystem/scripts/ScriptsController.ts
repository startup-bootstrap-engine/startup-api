import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { isAdminMiddleware } from "@providers/middlewares/IsAdminMiddleware";
import { controller, interfaces } from "inversify-express-utils";

@controller("/scripts", AuthMiddleware(), isAdminMiddleware)
export class ScriptsController implements interfaces.Controller {
  constructor() {}
}
