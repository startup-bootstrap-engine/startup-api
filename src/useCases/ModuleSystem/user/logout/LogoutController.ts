import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { HttpStatus } from "@startup-engine/shared";
import { Response } from "express";
import { controller, httpPost, interfaces } from "inversify-express-utils";
import { IAuthenticatedRequest } from "../../../../providers/types/ServerTypes";
import { LogoutUseCase } from "./LogoutUseCase";

@controller("/auth")
export class LogoutController implements interfaces.Controller {
  constructor(private logoutUseCase: LogoutUseCase) {}

  @httpPost("/logout", AuthMiddleware())
  public async logout(req: IAuthenticatedRequest, res: Response): Promise<any> {
    const user = req.user!;
    await this.logoutUseCase.logout(user);
    return res.status(HttpStatus.OK).send();
  }
}
