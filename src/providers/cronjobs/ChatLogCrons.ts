/* eslint-disable mongoose-lean/require-lean */
import { ChatLog } from "@entities/ModuleSystem/ChatLogModel";
import { TradeChatLog } from "@entities/ModuleSystem/TradeChatLogModal";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TRADE_CHAT_LOG_CLEANUP_THRESHOLD } from "@providers/constants/ChatConstants";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(ChatLogCrons)
export class ChatLogCrons {
  constructor(private newRelic: NewRelic, private cronJobScheduler: CronJobScheduler) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("chat-log-cron-delete-old-messages", "0 0 * * 7", async () => {
      await this.deleteOldChatLogMessages();
    });

    this.cronJobScheduler.uniqueSchedule("chat-log-cron-delete-old-trade-messages", "0 */12 * * *", async () => {
      await this.deleteOldTradeChatLogMessages();
    });
  }

  private async deleteOldChatLogMessages(): Promise<void> {
    await ChatLog.find({
      createdAt: {
        $lt: dayjs(new Date()).subtract(6, "months").toDate(),
      },
    }).deleteMany();
  }

  private async deleteOldTradeChatLogMessages(): Promise<void> {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - TRADE_CHAT_LOG_CLEANUP_THRESHOLD);
      await TradeChatLog.deleteMany({ createdAt: { $lt: threeDaysAgo } });
    } catch (error) {
      console.error("Error deleting old messages:", error);
    }
  }
}
