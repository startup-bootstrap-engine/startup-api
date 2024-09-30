import { EnvType } from "@startup-engine/shared/dist";
import { provide } from "inversify-binding-decorators";
import Mixpanel from "mixpanel";
import { IUser } from "../../entities/ModuleSystem/UserModel";
import { appEnv } from "../config/env";

@provide(MixpanelTracker)
export class MixpanelTracker {
  private mixpanel: Mixpanel.Mixpanel | null = null;

  constructor() {
    this.mixpanel = Mixpanel.init(appEnv.analytics.mixpanelToken!, {
      protocol: "https",
    });
  }

  public track(eventName: string, user?: IUser): void {
    try {
      if (appEnv.general.ENV === EnvType.Development) {
        console.log(
          `✨ Mixpanel: Tracking event ${eventName} ${user ? `for user ${user.email}` : ""} (disabled in development)`
        );

        return;
      }

      if (!this.mixpanel) {
        console.log("✨ Mixpanel is not initialized");
        return;
      }

      console.log(`✨ Mixpanel: Tracking event ${eventName} ${user ? `for user ${user.email}` : ""}`);
      let properties;
      if (user) {
        properties = { distinct_id: user._id, time: new Date() };
      } else {
        properties = { time: new Date() };
      }

      this.mixpanel?.track(eventName, properties, (err) => {
        if (err) {
          console.log(err);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  public setUserInfo(user: IUser): void {
    try {
      if (appEnv.general.ENV === EnvType.Development) {
        return;
      }

      this.mixpanel?.people.set(
        user._id,
        {
          $first_name: user.name,
          $created: user.createdAt,
          $region: user.address,
          plan: user.role,
          $email: user.email,
          address: user.address,
          phone: user.phone,
        },
        {
          $ip: "127.0.0.1",
        }
      );
    } catch (error) {
      console.error(error);
    }
  }
}
