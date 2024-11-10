import { Identify } from "@amplitude/identify";
import { DEFAULT_DATE_FORMAT } from "@providers/constants/DateConstants";
import { MixpanelTracker } from "@providers/mixpanel/Mixpanel";
import { EnvType, IUser } from "@startup-engine/shared";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { appEnv } from "../config/env";
import { amplitudeClient } from "../constants/AnalyticsConstants";

@provide(AnalyticsHelper)
export class AnalyticsHelper {
  constructor(private mixpanelTracker: MixpanelTracker) {}

  public async track(eventName: string, user?: IUser): Promise<void> {
    try {
      if (appEnv.general.ENV === EnvType.Development && !appEnv.general.IS_UNIT_TEST) {
        console.log(
          `✨ Analytics: Tracking event ${eventName} ${user ? `for user ${user.email}` : ""} (disabled in development)`
        );
        return;
      }

      console.log(`✨ Analytics: Tracking event ${eventName} ${user ? `for user ${user.email}` : ""}`);

      await amplitudeClient.logEvent({
        event_type: eventName,
        user_id: user?.email,
        ip: "127.0.0.1",
        event_properties: {
          time: new Date(),
        },
      });
      await amplitudeClient.flush();

      let mixpanelProperties;
      if (user) {
        mixpanelProperties = { distinct_id: user.id, time: new Date() };
      } else {
        mixpanelProperties = { time: new Date() };
      }

      this.mixpanelTracker.track(eventName, mixpanelProperties);
    } catch (error) {
      console.error(error);
    }
  }

  public async updateUserInfo(user: IUser): Promise<void> {
    try {
      if (appEnv.general.ENV === EnvType.Development) {
        return;
      }

      console.log(`✨ Analytics: People set > Updating user info for user ${user.email}`);

      if (user) {
        // amplitude user
        const identify = new Identify();
        identify.set("start_date", dayjs(new Date()).format(DEFAULT_DATE_FORMAT));

        await amplitudeClient.identify(user.id, user.id, identify);

        // mixpanel user
        this.mixpanelTracker.setUserInfo(user);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
