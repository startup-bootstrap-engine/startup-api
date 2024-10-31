import { BadRequestError } from "@providers/errors/BadRequestError";
import { DTOValidatorMiddleware } from "@providers/middlewares/DTOValidatorMiddleware";
import { TS } from "@providers/translation/TranslationHelper";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { IAuthResponse, UserAuthFlow } from "@startup-engine/shared";
import { controller, httpPost, interfaces, request, requestBody } from "inversify-express-utils";
import { AppleOAuthDTO } from "../AuthDTO";
import { AppleOAuthUseCase } from "./AppleOAuthUseCase";

@controller("/auth")
export class AppleOAuthController implements interfaces.Controller {
  constructor(
    private appleOAuthUseCase: AppleOAuthUseCase,
    private userRepository: UserRepository
  ) {}

  @httpPost("/apple", DTOValidatorMiddleware(AppleOAuthDTO))
  public async appleOAuth(@requestBody() appleOAuthDTO: AppleOAuthDTO, @request() req): Promise<IAuthResponse> {
    // Check if this user was registered using a Basic auth flow (instead of Google OAuth)

    const userWithBasic = await this.userRepository.findBy({
      email: appleOAuthDTO.email,
      authFlow: UserAuthFlow.Basic,
    });

    if (userWithBasic) {
      throw new BadRequestError(TS.translate("auth", "accountAuthFlowMismatch"));
    }

    const { accessToken, refreshToken } = await this.appleOAuthUseCase.appleOAuthSync(appleOAuthDTO);

    return {
      accessToken,
      refreshToken,
    };
  }
}
