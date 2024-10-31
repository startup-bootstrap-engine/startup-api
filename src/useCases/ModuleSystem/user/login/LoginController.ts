import { DTOValidatorMiddleware } from "@providers/middlewares/DTOValidatorMiddleware";
import { AuthRateLimitMiddleware } from "@providers/middlewares/RateLimitMiddleware";
import { IAuthResponse } from "@startup-engine/shared";
import { controller, httpPost, interfaces, request, requestBody } from "inversify-express-utils";
import { AuthLoginDTO } from "../AuthDTO";
import { LoginUseCase } from "./LoginUseCase";

//! Reference:
//! Cloud setup: https://medium.com/the-dev-caf%C3%A9/log-in-with-google-oauth-2-0-node-js-and-passport-js-1f8abe096175 (ignore the passport part)
//! Logic: https://medium.com/@tomanagle/google-oauth-with-node-js-4bff90180fe6
@controller("/auth", AuthRateLimitMiddleware())
export class BasicEmailPwLoginController implements interfaces.Controller {
  constructor(private loginUseCase: LoginUseCase) {}

  @httpPost("/login", DTOValidatorMiddleware(AuthLoginDTO))
  public async login(@requestBody() authLoginDTO: AuthLoginDTO, @request() req): Promise<IAuthResponse> {
    const { accessToken, refreshToken } = await this.loginUseCase.login(authLoginDTO);

    return {
      accessToken,
      refreshToken,
    };
  }
}
