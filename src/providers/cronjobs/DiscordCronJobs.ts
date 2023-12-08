import { DiscordBot } from "@providers/discord/DiscordBot";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(DiscordCronJobs)
export class DiscordCronJobs {
  constructor(private cronJobScheduler: CronJobScheduler, private discordBot: DiscordBot) {}

  public schedule(): void {
    // Schedule the cron job to run every 3 days
    this.cronJobScheduler.uniqueSchedule("discord-beginners-guide-cron", "0 0 * * 1,3,5", async () => {
      await this.sendBeginnersGuideCronJob();
    });

    this.cronJobScheduler.uniqueSchedule("discord-premium-account-cron", "0 0 * * 2,4", async () => {
      await this.sendPremiumAccountCronJob();
    });

    this.cronJobScheduler.uniqueSchedule("discord-shop-cron", "0 0 * * 6,7", async () => {
      await this.sendShopCronJob();
    });

    this.cronJobScheduler.uniqueSchedule("discord-review-request-cron", "0 0 * * 1,3,6", async () => {
      await this.sendReviewRequestCronJob();
    });
  }

  private async sendReviewRequestCronJob(): Promise<void> {
    try {
      const message = `
      🔥 Calling all Definya Champions for REVIEWS! 🔥
      
      Brave adventurers, your valor in the lands of Definya has been the stuff of legends. Now, we seek your aid in a noble quest beyond the battlefield: Share your tales of glory and might with the world! 🌟
      
      Your experiences, your battles, your victories... let them be known. Rate and review Definya on STEAM and Google Play, and let your voice guide future heroes on their journey!
      
      🔗 STEAM: [Definya 2D MMORPG](https://store.steampowered.com/app/2630100/Definya_2D_MMORPG/?beta=0)
      🔗 Google Play: [Definya App](https://play.google.com/store/apps/details?id=com.definya.app)
      
      Together, we forge a legacy that will echo through the ages! ⚔️🛡️

      @everyone
      `;

      await this.discordBot.sendMessageWithColor(message, "announcements", "Review Request", "Green");
    } catch (error) {
      console.error(error);
    }
  }

  private async sendBeginnersGuideCronJob(): Promise<void> {
    try {
      // Your message content
      const message = `Feeling a little bit lost? 
        
        Checkout our BEGINNER'S GUIDE: https://defynia.gitbook.io/defynia-docs/how-it-works/guides/english/starterguide`;

      await this.discordBot.sendMessageWithColor(message, "announcements", "Tutorial", "DarkAqua");
    } catch (error) {
      console.error(`Failed to send Discord message: ${error}`);
    }
  }

  private async sendPremiumAccountCronJob(): Promise<void> {
    try {
      // Your message content
      const message = `🌟 **Elevate Your Definya Adventure - Join the Premium League!** 🌟

        🔗 Dive into the Elite: [Become a Premium Member Today](https://patreon.com/DefinyaMMORPG)
        
        **Why Go Premium? Unleash the Full Power of Definya!**
        
        ✨ **Enhanced Experience**: Boost your XP gain - Level up faster!
        
        🔥 **Greater Loot Drops**: Increased chances for rare finds. Your next epic item awaits!
        
        🌈 **Colorful Identity**: Stand out with a custom-colored character name depending on your plan. Show your true colors!
        
        💀 **Reduced Penalties**: Fear less, venture more with lowered SP XP and inventory loss on death.
        
        ⚡ **Swift Travels**: Reduced teleport cooldowns. Be everywhere, miss nothing!
        
        🛠️ **Crafting Bonanza**: Get more with each craft. More the rewards, better the fun!
        
        🔔 **Priority Support**: Have a question? Direct access to DM support - because you're a VIP.
        
        Support the server, enhance your journey, and join the ranks of Definya's finest. Your adventure awaits, hero. Are you ready to step up? 
        
        @everyone`;

      await this.discordBot.sendMessageWithColor(message, "announcements", "Premium Account", "Gold");
    } catch (error) {
      console.error(`Failed to send Discord message: ${error}`);
    }
  }

  private async sendShopCronJob(): Promise<void> {
    try {
      // Your message content
      const message = `⚔️ **Explore Our Exclusive Item Shop!**

      Discover a range of special items like:
      
      - Extra depot slots
      - Amulet of Death
      - Greater Mana potions (100x)
      - Greater Life potions (100x)
      - Character name change

      Ingredients:
      - Gems Pack (100x Blue sapphire, 100x Red sapphire, 50x Jade)
      - Rope (100x)
      - Water (100x)
      
      🛒 Access it here: [Definya Item Shop](https://www.patreon.com/definyammorpg/shop)
      
      @everyone`;

      await this.discordBot.sendMessageWithColor(message, "announcements", "Premium Account", "Gold");
    } catch (error) {
      console.error(`Failed to send Discord message: ${error}`);
    }
  }
}
