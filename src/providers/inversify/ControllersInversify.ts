import { ITSDecorator, TsDefaultDecorator } from "@providers/constants/ValidationConstants";
import { SocketsController } from "@useCases/ModuleSockets/SocketsController";
import { ABTestController } from "@useCases/ModuleSystem/abTests/ABTestController";
import { CacheController } from "@useCases/ModuleSystem/cache/CacheController";
import { IndustriesController } from "@useCases/ModuleSystem/industries/IndustriesController";

import { PushNotificationController } from "@useCases/ModuleSystem/operation/pushNotification/PushNotificationController";
import { PingController } from "@useCases/ModuleSystem/ping/PingController";
import { PlacesController } from "@useCases/ModuleSystem/places/PlacesController";
import { PremiumAccountController } from "@useCases/ModuleSystem/premiumAccount/PremiumAccountController";
import { ScriptsController } from "@useCases/ModuleSystem/scripts/ScriptsController";
import { AppleOAuthController } from "@useCases/ModuleSystem/user/appleOAuth/AppleOAuthController";
import { ChangePasswordController } from "@useCases/ModuleSystem/user/changePassword/ChangePasswordController";
import { ForgotPasswordController } from "@useCases/ModuleSystem/user/forgotPassword/ForgotPasswordController";
import { GenerateGoogleOAuthUrlController } from "@useCases/ModuleSystem/user/generateGoogleOAuthUrl/GenerateGoogleOAuthUrlController";
import { GetGoogleUserController } from "@useCases/ModuleSystem/user/getGoogleUser/GetGoogleUserController";
import { GoogleOAuthSyncController } from "@useCases/ModuleSystem/user/googleOAuthSync/GoogleOAuthSyncController";
import { BasicEmailPwLoginController } from "@useCases/ModuleSystem/user/login/LoginController";
import { LogoutController } from "@useCases/ModuleSystem/user/logout/LogoutController";
import { OwnInfoUserController } from "@useCases/ModuleSystem/user/ownInfo/OwnInfoUserController";
import { UserPreferenceController } from "@useCases/ModuleSystem/user/preferences/UserPreferenceController";
import { RefreshController } from "@useCases/ModuleSystem/user/refreshToken/RefreshController";
import { SignUpController } from "@useCases/ModuleSystem/user/signup/SignUpController";
import { UnsubscribeUsercontroller } from "@useCases/ModuleSystem/user/unsubscribe/UnsubscribeUsercontroller";
import { UpdateUserController } from "@useCases/ModuleSystem/user/update/UpdateUserController";
import { ContainerModule, interfaces } from "inversify";

export const userControllerContainer = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<UpdateUserController>(UpdateUserController).toSelf();
  bind<ChangePasswordController>(ChangePasswordController).toSelf();
  bind<ForgotPasswordController>(ForgotPasswordController).toSelf();
  bind<GenerateGoogleOAuthUrlController>(GenerateGoogleOAuthUrlController).toSelf();
  bind<GetGoogleUserController>(GetGoogleUserController).toSelf();
  bind<BasicEmailPwLoginController>(BasicEmailPwLoginController).toSelf();
  bind<LogoutController>(LogoutController).toSelf();
  bind<OwnInfoUserController>(OwnInfoUserController).toSelf();
  bind<RefreshController>(RefreshController).toSelf();
  bind<SignUpController>(SignUpController).toSelf();
  bind<UnsubscribeUsercontroller>(UnsubscribeUsercontroller).toSelf();
  bind<GoogleOAuthSyncController>(GoogleOAuthSyncController).toSelf();
  bind<AppleOAuthController>(AppleOAuthController).toSelf();
  bind<PushNotificationController>(PushNotificationController).toSelf();
  bind<PingController>(PingController).toSelf();
  bind<UserPreferenceController>(UserPreferenceController).toSelf();
});

export const dbTasksControllerContainer = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {});

export const formControllerContainer = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<IndustriesController>(IndustriesController).toSelf();
  bind<PlacesController>(PlacesController).toSelf();
});

export const abTestsControllerContainer = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<ABTestController>(ABTestController).toSelf();
});

export const useCasesControllers = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
  bind<ITSDecorator>("ITSDecorator").to(TsDefaultDecorator);
  bind<SocketsController>(SocketsController).toSelf();
  bind<CacheController>(CacheController).toSelf();

  bind<ScriptsController>(ScriptsController).toSelf();
  bind<PremiumAccountController>(PremiumAccountController).toSelf();
});
