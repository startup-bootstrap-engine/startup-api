import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { IGoogleOAuthUserInfoResponse, UserAuthFlow } from "@startup-engine/shared";
import { Request, Response } from "express";
import { controller, httpGet, interfaces, request, response } from "inversify-express-utils";
import { appEnv } from "../../../../providers/config/env";
import { GoogleOAuthSyncUseCase } from "../googleOAuthSync/GoogleOAuthSyncUseCase";
import { GetGoogleUserUseCase } from "./GetGoogleUserUseCase";

//! Reference:
//! Cloud setup: https://medium.com/the-dev-caf%C3%A9/log-in-with-google-oauth-2-0-node-js-and-passport-js-1f8abe096175 (ignore the passport part)
//! Logic: https://medium.com/@tomanagle/google-oauth-with-node-js-4bff90180fe6
@controller("/auth")
export class GetGoogleUserController implements interfaces.Controller {
  constructor(
    private getGoogleUserUseCase: GetGoogleUserUseCase,
    private googleOAuthSyncUseCase: GoogleOAuthSyncUseCase,
    private userRepository: UserRepository
  ) {}

  @httpGet("/google/redirect")
  public async googleOAuthRedirect(@request() req: Request, @response() res: Response): Promise<Response> {
    try {
      const {
        code,
        // scope
      } = req.query;

      // Validate code parameter
      if (!code) {
        res.status(400).json({ message: "Authorization code is required" });
        return res;
      }

      if (typeof code !== "string" || code.trim().length === 0) {
        res.status(400).json({ message: "Invalid authorization code" });
        return res;
      }

      const googleUserInfo: IGoogleOAuthUserInfoResponse = await this.getGoogleUserUseCase.getGoogleUser(code);

      // Check if this user was registered using a Basic auth flow (instead of Google OAuth)
      const user = await this.userRepository.findBy({ email: googleUserInfo.email });

      if (user && user.authFlow === UserAuthFlow.Basic) {
        // on this case it's google only oauth method...
        res.redirect(`${appEnv.general.APP_URL}/auth?errorType=auth&&errorMessage=accountAuthFlowMismatch`);
        return res;
      }

      const { accessToken, refreshToken } = await this.googleOAuthSyncUseCase.googleOAuthSync(googleUserInfo);

      // redirect to our APP with a provided accessToken ( so he can fetch his user info )
      res.redirect(`${appEnv.general.APP_URL}/auth?&accessToken=${accessToken}&refreshToken=${refreshToken}`);
      return res;
    } catch (error) {
      // Handle errors
      res.status(400).json({ message: "Failed to authenticate with Google" });
      return res;
    }
  }
}
