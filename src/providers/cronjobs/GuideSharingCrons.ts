import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";
import { DiscordBot } from "@providers/discord/DiscordBot";

@provide(GuideSharing)
export class GuideSharing {
  constructor(private cronJobScheduler: CronJobScheduler, private discordBot: DiscordBot) {}

  public schedule(): void {
    // Schedule the cron job to run every 3 days
    this.cronJobScheduler.uniqueSchedule("discord-message-cron", "0 0 */3 * *", async () => {
      await this.sendDiscordMessage();
    });
  }

  private async sendDiscordMessage(): Promise<void> {
    try {
      // Your message content
      const message =
        "Feeling a little bit lost? \nCheckout our BEGINNER'S GUIDE: https://defynia.gitbook.io/defynia-docs/how-it-works/guides/english/starterguide";

      // The Discord channel where you want to send the message
      const channelName = "announcements"; // Replace with your channel name

      // Send the message using your DiscordBot class
      await this.discordBot.sendMessage(message, channelName);
    } catch (error) {
      console.error(`Failed to send Discord message: ${error}`);
    }
  }
}
