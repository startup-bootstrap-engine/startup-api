import { BadRequestError } from "@providers/errors/BadRequestError";
import { AuthMiddleware } from "@providers/middlewares/AuthMiddleware";
import { TS } from "@providers/translation/TranslationHelper";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { HttpStatus } from "@startup-engine/shared";
import { Request, Response } from "express";
import { controller, httpGet, interfaces, request, requestParam, response } from "inversify-express-utils";
import { isAdminMiddleware } from "../../../../providers/middlewares/IsAdminMiddleware";
import { PushNotificationHelper } from "../../../../providers/pushNotification/PushNotificationHelper";

@controller("/operations", AuthMiddleware, isAdminMiddleware)
export class PushNotificationController implements interfaces.Controller {
  constructor(private pushNotificationHelper: PushNotificationHelper, private userRepository: UserRepository) {}

  @httpGet("/push-notification/test/:userId")
  private async submitTestPushNotification(
    @requestParam("userId") userId,
    @request() req: Request,
    @response() res: Response
  ): Promise<Response> {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new BadRequestError(TS.translate("validation", "notFound", { field: "user" }));
      }

      const userPushToken = user.pushNotificationToken;

      if (!userPushToken) {
        throw new BadRequestError(TS.translate("validation", "notFound", { field: "user.pushNotificationToken" }));
      }

      await this.pushNotificationHelper.sendMessage(userPushToken, "Hello World", "Your push notification works!");

      return res.status(HttpStatus.OK).send({
        status: "success",
        message: "Push notification submitted",
      });
    } catch (error: any) {
      console.error(error);

      throw new BadRequestError(error.message);
    }
  }
}
