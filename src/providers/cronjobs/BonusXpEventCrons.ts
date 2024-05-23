import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";
import { DiscordBot } from "@providers/discord/DiscordBot";
import { DynamicGlobalsManager } from "@providers/global/DynamicGlobalsManager";
import {
  BONUS_XP_CHANNEL,
  BONUS_XP_CRON_STRING,
  BONUS_XP_MESSAGE,
  DAYS_ON,
  DEFAULT_XP_RATIO,
  UPDATE_XP_RATIO,
} from "@providers/constants/GlobalXpRatioConstants";
import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { IUIShowMessage, UISocketEvents } from "@rpg-engine/shared";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";

@provide(BonusXpEventCrons)
export class BonusXpEventCrons {
  constructor(
    private cronJobScheduler: CronJobScheduler,
    private discordBot: DiscordBot,
    private socketMessaging: SocketMessaging
  ) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("weekend-xp-event-crons", BONUS_XP_CRON_STRING, async () => {
      const today = new Date();
      const daysON = DAYS_ON;

      const isBonusDay = daysON.includes(today.getDay());
      const _XpRatio = isBonusDay ? UPDATE_XP_RATIO : DEFAULT_XP_RATIO;

      if (isBonusDay) {
        DynamicGlobalsManager.updateXpRatio(_XpRatio);

        try {
          // discord
          await this.discordBot.sendMessage(BONUS_XP_MESSAGE, BONUS_XP_CHANNEL);
          // server msg to each player
          const allOnlineCharacters = await Character.find({ isOnline: true }).lean();
          for (const character of allOnlineCharacters) {
            this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
              message: BONUS_XP_MESSAGE,
              type: "info",
            });
          }
        } catch (error) {
          console.error("Bonus Msg error: ", error);
        }
      }
    });
  }
}
