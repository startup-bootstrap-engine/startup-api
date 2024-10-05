import { firebaseAdminApp } from "@providers/database/firebase/FirebaseApp";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { EnvType } from "@startup-engine/shared/dist";
import firebaseAdmin from "firebase-admin";
import { provide } from "inversify-binding-decorators";
import { appEnv } from "../config/env";

@provide(PushNotificationHelper)
export class PushNotificationHelper {
  public static firebaseAdmin: firebaseAdmin.app.App;

  constructor(private userRepository: UserRepository) {}

  // PS: I'm not initializing on the constructor because it causes a bug in firebase, since inversify leads to be it being triggered twice.
  public static initialize(): void {
    PushNotificationHelper.firebaseAdmin = firebaseAdminApp;
  }

  public async sendMessage(
    userToken: string,
    title: string,
    body: string,
    data?: { [key: string]: string }
  ): Promise<void> {
    console.log("Sending push notification message...");

    if (appEnv.general.ENV === EnvType.Development) {
      console.log("🚫 Push notifications disabled on development mode.");
      return;
    }

    try {
      const payload = {
        title,
        body,
      };

      const response = await PushNotificationHelper.firebaseAdmin.messaging().send({
        notification: payload,
        data: {
          ...data,
          ...payload,
        },
        token: userToken,
      });
      if (response.includes("messages")) {
        console.log("Push submitted successfully.");
      } else {
        console.log(response);

        if (response.includes("Requested entity was not found.")) {
          // const user = await User.findOne({ pushNotificationToken: userToken }).lean();
          const user = await this.userRepository.findBy({ pushNotificationToken: userToken });

          if (!user) {
            console.log("User not found");
            return;
          }

          await this.userRepository.updateById(user._id, {
            pushNotificationToken: "",
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
