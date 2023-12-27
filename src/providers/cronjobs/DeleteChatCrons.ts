import { ChatLog } from "@entities/ModuleSystem/ChatLogModel";
import { TradeChatLog } from "@entities/ModuleSystem/TradeChatLogModal";
import { NewRelic } from "@providers/analytics/NewRelic";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

const MAX_AGE_OF_MESSAGES = 30; // 30days

@provide(DeleteChatCrons)
export class DeleteChatCrons {
  constructor(private newRelic: NewRelic, private cronJobScheduler: CronJobScheduler) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("chat-log-cron-delete-old-messages", "0 */6 * * *", async () => {
      await this.deleteChatLogOldMessages();
    });
  }

  private async deleteChatLogOldMessages(): Promise<void> {
    await ChatLog.deleteMany({
      createdAt: {
        $lt: dayjs(new Date()).subtract(1, "hour").toDate(),
      },
    });
  }

  private async deleteOldMessages(): Promise<void> {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - MAX_AGE_OF_MESSAGES);
      await TradeChatLog.deleteMany({ createdAt: { $lt: threeDaysAgo } });
    } catch (error) {
      console.error("Error deleting old messages:", error);
    }
  }
}
