import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { DTOValidatorMiddleware } from "@providers/middlewares/DTOValidatorMiddleware";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { HttpStatus } from "@startup-engine/shared";
import { Response } from "express";
import { controller, httpPost, interfaces, JsonContent, requestBody } from "inversify-express-utils";
import { IAuthenticatedRequest } from "../../../../providers/types/ServerTypes";
import { AuthChangePasswordDTO } from "../AuthDTO";
import { ChangePasswordUseCase } from "./ChangePasswordUseCase";

//! Reference:
//! Cloud setup: https://medium.com/the-dev-caf%C3%A9/log-in-with-google-oauth-2-0-node-js-and-passport-js-1f8abe096175 (ignore the passport part)
//! Logic: https://medium.com/@tomanagle/google-oauth-with-node-js-4bff90180fe6
@controller("/auth")
export class ChangePasswordController implements interfaces.Controller {
  constructor(private changePasswordUseCase: ChangePasswordUseCase, private userRepository: UserRepository) {}

  @httpPost(
    "/change-password",
    DTOValidatorMiddleware(AuthChangePasswordDTO),
    AuthMiddleware({ hideSensitiveUserFields: false })
  )
  private async changePassword(
    @requestBody() authChangePasswordDTO,
    req: IAuthenticatedRequest,
    res: Response
  ): Promise<Response<JsonContent>> {
    const { user } = req;

    await this.changePasswordUseCase.changePassword(user!, authChangePasswordDTO);

    return res.status(HttpStatus.OK).send();
  }
}
