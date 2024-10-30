import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { IUser } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(LogoutUseCase)
export class LogoutUseCase {
  constructor(private analyticsHelper: AnalyticsHelper, private userRepository: UserRepository) {}

  public async logout(user: IUser, refreshToken: string): Promise<void> {
    //! Remember that JWT tokens are stateless, so there's nothing on server side to remove besides our refresh tokens. Make sure that you wipe out all JWT data from the client. Read more at: https://stackoverflow.com/questions/37959945/how-to-destroy-jwt-tokens-on-logout#:~:text=You%20cannot%20manually%20expire%20a,DB%20query%20on%20every%20request.

    const updatedRefreshTokens = user.refreshTokens?.filter(
      (token) => token?.token?.toString() !== refreshToken.toString()
    );

    await this.userRepository.updateBy({ id: user.id }, { refreshTokens: updatedRefreshTokens });

    void this.analyticsHelper.track("UserLogout", user);
  }
}
