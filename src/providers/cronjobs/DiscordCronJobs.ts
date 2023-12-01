import { DiscordBot } from "@providers/discord/DiscordBot";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(DiscordCronJobs)
export class DiscordCronJobs {
  constructor(private cronJobScheduler: CronJobScheduler, private discordBot: DiscordBot) {}

  public schedule(): void {
    // Schedule the cron job to run every 3 days
    this.cronJobScheduler.uniqueSchedule("discord-beginners-guide-cron", "0 0 */4 * *", async () => {
      await this.sendBeginnersGuideCronJob();
    });

    this.cronJobScheduler.uniqueSchedule("discord-paid-features-cron", "0 0 */3 * *", async () => {
      await this.sendPaidFeaturesCronJob();
    });
  }

  private async sendBeginnersGuideCronJob(): Promise<void> {
    try {
      // Your message content
      const message =
        "Feeling a little bit lost? \nCheckout our BEGINNER'S GUIDE: https://defynia.gitbook.io/defynia-docs/how-it-works/guides/english/starterguide";

      await this.discordBot.sendMessageWithColor(message, "announcements", "TUTORIAL", "DarkAqua");
    } catch (error) {
      console.error(`Failed to send Discord message: ${error}`);
    }
  }

  private async sendPaidFeaturesCronJob(): Promise<void> {
    try {
      // Your message content
      const message =
        "⚔️ Want to support the server and get some cool perks? \nCheckout our Premium Plans: https://patreon.com/DefinyaMMORPG";

      await this.discordBot.sendMessageWithColor(message, "announcements", "Premium Account", "Gold");
    } catch (error) {
      console.error(`Failed to send Discord message: ${error}`);
    }
  }
}
