import { DTOValidatorMiddleware } from "@providers/middlewares/DTOValidatorMiddleware";
import { HttpStatus } from "@startup-engine/shared";
import { Request, Response } from "express";
import { JsonContent, controller, httpPost, interfaces, requestBody } from "inversify-express-utils";
import { ForgotPasswordDTO } from "../AuthDTO";
import { ForgotPasswordUseCase } from "./ForgotPasswordUseCase";

//! Reference:
//! Cloud setup: https://medium.com/the-dev-caf%C3%A9/log-in-with-google-oauth-2-0-node-js-and-passport-js-1f8abe096175 (ignore the passport part)
//! Logic: https://medium.com/@tomanagle/google-oauth-with-node-js-4bff90180fe6
@controller("/auth")
export class ForgotPasswordController implements interfaces.Controller {
  constructor(private forgotPasswordUseCase: ForgotPasswordUseCase) {}

  @httpPost("/forgot-password", DTOValidatorMiddleware(ForgotPasswordDTO))
  private async forgotPassword(@requestBody() body, req: Request, res: Response): Promise<Response<JsonContent>> {
    const { email } = body;

    await this.forgotPasswordUseCase.forgotPassword(email);

    return res.status(HttpStatus.OK).send();
  }
}
