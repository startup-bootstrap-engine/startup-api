import { DTOValidatorMiddleware } from "@providers/middlewares/DTOValidatorMiddleware";
import { IAuthResponse } from "@startup-engine/shared";
import rateLimit from "express-rate-limit";
import { controller, httpPost, interfaces, request, requestBody } from "inversify-express-utils";
import { AuthLoginDTO } from "../AuthDTO";
import { LoginUseCase } from "./LoginUseCase";

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

//! Reference:
//! Cloud setup: https://medium.com/the-dev-caf%C3%A9/log-in-with-google-oauth-2-0-node-js-and-passport-js-1f8abe096175 (ignore the passport part)
//! Logic: https://medium.com/@tomanagle/google-oauth-with-node-js-4bff90180fe6
@controller("/auth", loginRateLimiter)
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
