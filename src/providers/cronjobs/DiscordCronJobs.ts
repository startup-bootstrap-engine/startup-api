import { DiscordBot } from "@providers/discord/DiscordBot";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(DiscordCronJobs)
export class DiscordCronJobs {
  constructor(private cronJobScheduler: CronJobScheduler, private discordBot: DiscordBot) {}

  public schedule(): void {
    // Every monday
    this.cronJobScheduler.uniqueSchedule("discord-beginners-guide-cron", "0 0 * * 1", async () => {
      await this.sendBeginnersGuideCronJob();
    });

    // Every tuesday
    this.cronJobScheduler.uniqueSchedule("discord-social-crystal-cron", "0 5 * * 1,3,5,0", async () => {
      await this.sendSocialCrystalReferralRequest();
    });

    // Every tue, thu
    this.cronJobScheduler.uniqueSchedule("discord-premium-account-cron", "0 0 * * 2,4", async () => {
      await this.sendPremiumAccountCronJob();
    });

    // Every wed, sat
    this.cronJobScheduler.uniqueSchedule("discord-shop-cron", "0 0 * * 3,6", async () => {
      await this.sendShopCronJob();
    });

    this.cronJobScheduler.uniqueSchedule("discord-review-request-cron", "0 0 * * 3", async () => {
      await this.sendReviewRequestCronJob();
    });

    // Every tue, sun
    this.cronJobScheduler.uniqueSchedule("discord-training-area-cron", "0 0 * * 2,7", async () => {
      await this.sendTrainingAreaCronJob();
    });

    // every mon, wed
    this.cronJobScheduler.uniqueSchedule("discord-reviews-prizes", "0 0 * * 1,3", async () => {
      await this.sendReviewsAndPrizesMessage();
    });

    //! Special events

    // christmas
    this.cronJobScheduler.uniqueSchedule("discord-christmas-cron", "0 0 25 12 *", async () => {
      await this.sendChristmasCronJob();
    });

    // happy new year
    this.cronJobScheduler.uniqueSchedule("discord-happy-new-year-cron", "0 0 1 1 *", async () => {
      await this.sendHappyNewYearCronJob();
    });

    // valentines
    this.cronJobScheduler.uniqueSchedule("discord-valentines-day-cron", "0 0 14 2 *", async () => {
      await this.sendValentinesDayCronJob();
    });

    // easter
    this.cronJobScheduler.uniqueSchedule("discord-easter-cron", "0 0 4 4 *", async () => {
      await this.sendEasterCronJob();
    });

    // summer
    this.cronJobScheduler.uniqueSchedule("discord-summer-cron", "0 0 21 6 *", async () => {
      await this.sendSummerCronJob();
    });

    // halloween
    this.cronJobScheduler.uniqueSchedule("discord-halloween-cron", "0 0 31 10 *", async () => {
      await this.sendHalloweenCronJob();
    });
  }

  private async sendReviewsAndPrizesMessage(): Promise<void> {
    try {
      const message = `⚔️  REVIEWS AND PRIZES ⚔️ 

      Please leave a review on the stores! We work hard everyday to bring you new game updates. This costs a lot of time and money.
      
      🔗 [STEAM](https://store.steampowered.com/app/2630100/Definya_2D_MMORPG/?beta=0)
      🔗 [Google Play](https://play.google.com/store/apps/details?id=com.definya.app)
      
      🔥  DM me if you leave a review (with screenshot) there's a surprise for you (PS: You have to submit a friend request to me) 🔥 
      
      Also, if you want to learn more about the game, check out [our docs](https://docs.definya.com/)
      
      Or just buy a [premium account](https://patreon.com/DefinyaMMORPG)
      
      🔥 We're also looking for mappers, devs or community mods. DM Trololo admin!
      
      @everyone
      `;

      await this.discordBot.sendMessageWithColor(
        message,
        "announcements",
        "Reviews x Prizes!",
        "Green",
        "https://i.imgur.com/LGdrHYD.png"
      );
    } catch (error) {
      console.error(error);
    }
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

      await this.discordBot.sendMessageWithColor(
        message,
        "general",
        "Review Request",
        "Green",
        "https://i.imgur.com/LGdrHYD.png"
      );
    } catch (error) {
      console.error(error);
    }
  }

  private async sendSocialCrystalReferralRequest(): Promise<void> {
    try {
      const message = `
      **💎 Earn Gold to Gear Up (Get Social Crystals)! 💎**
      
      Definya heroes, your journey has been epic! Now, it's time to level up even more. Share your referral link and earn Social Crystals worth **8-10k gold** on the marketplace! 💎
  
      **Use this gold to gear up your character with the best weapons and armor!** ⚔️🛡️
  
      Click the **colored diamond button** and share your link with friends or on targeted groups. Let's bring more adventurers to the land of Definya and become even stronger together!
      
      **Together, we rise!** 💪
  
      @everyone
      `;

      await this.discordBot.sendMessageWithColor(
        message,
        "general",
        "Earn Gold to Gear Up",
        "Blue",
        "https://imgur.com/OgXeOzE"
      );
    } catch (error) {
      console.error(error);
    }
  }

  private async sendBeginnersGuideCronJob(): Promise<void> {
    try {
      const message = `Feeling a little bit lost? 

      📚 **Useful links** 📚
        
      - **[Definya Wiki](https://docs.definya.com/)**: Your go-to guide for all things Definya.
        - **[Definya Guide - Starter](https://docs.definya.com/docs/guides/english/StarterGuide)**: Get started on your epic journey.
        - **[Definya Guide - Hunts](https://docs.definya.com/docs/guides/english/Hunts)**: Master the art of hunting.
        - **[Definya Guide - Mining](https://docs.definya.com/docs/guides/english/Mining)**: Mining spots
      - **[Definya Patreon](https://patreon.com/DefinyaMMORPG)**: Support the game and unlock exclusive perks.
      - **[Definya Steam](https://store.steampowered.com/app/2630100/Definya_2D_MMORPG/?beta=0)**: Download the game on Steam.
      - **[Definya Google Play](https://play.google.com/store/apps/details?id=com.definya.app)**: Get the game on Google Play.`;

      await this.discordBot.sendMessageWithColor(
        message,
        "general",
        "Useful Links",
        "DarkAqua",
        "https://i.imgur.com/DrZ060m.png"
      );
    } catch (error) {
      console.error(`Failed to send Discord message: ${error}`);
    }
  }

  private async sendTrainingAreaCronJob(): Promise<void> {
    try {
      const message = `⚔️ **Exclusive Training Room Access - Premium Members Only!**

      Elevate your abilities with premium access to our advanced training rooms in Definya:
      
      - **Train Resistance / Magic Resistance**: Boost your defenses against powerful spells and attacks.
      - **Train Your Offensive Skills**: Hone your combat abilities to master the art of war.
      - **Teleport Scroll NPC**: Purchase teleport scrolls to swiftly navigate to crucial locations.
      - **NPC Selling Training Equipment**: Acquire top-tier training gear specifically designed for skill development.
      - **24/7 Availability**: Improve your skills anytime with round-the-clock access to our facilities.
      
      🌟 Your journey to becoming a legendary warrior starts in our exclusive training rooms!
      
      🔗 Take the leap to greatness. Become a Premium Member now: [Definya Premium](https://patreon.com/DefinyaMMORPG)
      
      @everyone
      `;

      await this.discordBot.sendMessageWithColor(
        message,
        "general",
        "Training Room",
        "Gold",
        "https://i.imgur.com/LVm6okZ.png"
      );
    } catch (error) {
      console.error(error);
    }
  }

  private async sendPremiumAccountCronJob(): Promise<void> {
    try {
      // Your message content
      const message = `🌟 **Elevate Your Definya Adventure - Join the Premium League!** 🌟

        🔗 Dive into the Elite: [Become a Premium Member Today](https://patreon.com/DefinyaMMORPG)
        
        **Why Go Premium? Unleash the Full Power of Definya!**
        
        ⚔️ **Training Room Access**: You can train there 24/7 if you wish!
 
        🌈 **Colorful Identity**: Stand out with a custom-colored character name depending on your plan. Show your true colors!
        
        💀 **Reduced Penalties**: Fear less, venture more with lowered SP XP and inventory loss on death.
        
        ⚡ **Swift Travels**: Reduced teleport cooldowns. Be everywhere, miss nothing!
        
        🛠️ **Crafting Bonanza**: Get more with each craft. More the rewards, better the fun!
        
        🔔 **Priority Support**: Have a question? Direct access to DM support - because you're a VIP.
        
        Support the server, enhance your journey, and join the ranks of Definya's finest. Your adventure awaits, hero. Are you ready to step up? 
        
        @everyone`;

      await this.discordBot.sendMessageWithColor(
        message,
        "general",
        "Premium Account",
        "Gold",
        "https://i.imgur.com/1oqejn7.png"
      );
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
      - Social Crystals (50x)
      - Cleanup PK Skull
      
      Ingredients:
      
      - Gems Pack (100x Blue sapphire, 100x Red sapphire, 50x Jade)
      - Rope (100x)
      - Water (100x)
      
      🛒 Access it here: [Definya Item Shop](https://www.patreon.com/definyammorpg/shop)
      
      @everyone`;

      await this.discordBot.sendMessageWithColor(
        message,
        "general",
        "Premium Account",
        "Gold",
        "https://i.imgur.com/87eT8Rn.png"
      );
    } catch (error) {
      console.error(`Failed to send Discord message: ${error}`);
    }
  }

  private async sendChristmasCronJob(): Promise<void> {
    try {
      const message = `🎄 **Merry Christmas!**

      As the snow settles over the mystical lands of Definya, we wanted to take a moment to spread some holiday cheer. May your quests be merry, your loot plentiful, and your adventures grand.
      
      Merry Christmas to you and your companions! May your day be filled with joy, laughter, and perhaps a festive quest or two. 🌟
      
      Stay safe, stay warm, and let's make some magical memories this holiday season.
      
      Happy Holidays!
      - The Definya Team

      @everyone`;

      await this.discordBot.sendMessageWithColor(
        message,
        "announcements",
        "Merry Christmas",
        "Purple",
        "https://i.imgur.com/tut4teS.png"
      );
    } catch (error) {
      console.error(error);
    }
  }

  private async sendHappyNewYearCronJob(): Promise<void> {
    try {
      const message = `🎉 **Happy New Year, Adventurers!**

      As the clock strikes midnight, a new year unfolds in the enchanted realm of Definya. We're grateful to have journeyed through another year with all of you, brave and bold adventurers.

      May the new year bring you closer to the fabled treasures you seek, the allies you cherish, and the quests that thrill your spirit. Let's raise our swords to new beginnings, uncharted lands, and legendary stories waiting to be told.
      
      Here's to health, happiness, and epic adventures in the coming year. Happy New Year, everyone! May it be as magical and rewarding as the realms we explore together.
      
      Cheers to a New Year!
      - The Definya Team 
      @everyone
      `;

      await this.discordBot.sendMessageWithColor(
        message,
        "announcements",
        "Happy New Year",
        "Purple",
        "https://i.imgur.com/1ZiJo15.png"
      );
    } catch (error) {
      console.error(error);
    }
  }

  private async sendValentinesDayCronJob(): Promise<void> {
    try {
      const message = `💖 **Happy Valentine's Day, Brave Hearts of Definya!**

      On this day of love and friendship, we celebrate the bonds that make our journeys worthwhile. Whether you're embarking on quests with your cherished partner or standing shoulder to shoulder with trusted allies, remember that the strongest magic of all is love.
      
      Share a potion, gift a rare item, or simply send a heartfelt message to those who make every adventure brighter. Let's spread love and camaraderie across the lands and dungeons far and wide.
      
      May your day be filled with joy, your battles be victorious, and your bonds stronger than the toughest armor. Happy Valentine's Day to all the valiant hearts!
      
      With love and admiration,
      - The Definya Team
      @everyone
      `;

      await this.discordBot.sendMessageWithColor(
        message,
        "announcements",
        "Happy Valentine's Day",
        "Purple",
        "https://i.imgur.com/NKCJCiX.png"
      );
    } catch (error) {
      console.error(error);
    }
  }

  private async sendEasterCronJob(): Promise<void> {
    const message = `🐣 **Happy Easter, Heroes of Definya!**

    As the world blooms into the splendor of spring, we gather to celebrate Easter and the spirit of renewal and hope. It's a time for quests of rejuvenation, seeking out hidden eggs and mythical creatures born from the magic of the season.
    
    Gather your party and embark on springtime adventures, uncovering treasures and mysteries sprinkled throughout the land. May your baskets be filled with bountiful loot and your hearts with the joy of discovery and camaraderie.
    
    Join us in celebrating the wonder of new beginnings and the enduring strength of our community. Happy Easter, and may your journey be as bright and hopeful as the dawn of spring!
    
    Wishing you all a joyous and adventurous Easter!
    - The Definya Team
    
    @everyone`;

    await this.discordBot.sendMessageWithColor(
      message,
      "announcements",
      "Happy Easter",
      "Purple",
      "https://i.imgur.com/V95swTB.png"
    );
  }

  private async sendSummerCronJob(): Promise<void> {
    try {
      const message = `🌞 **Summer Greetings, Definya Adventurers!**

      As the sun climbs high and the days stretch long, we welcome the vibrant season of summer. It's a time for grand explorations, epic quests under the sun, and forging lasting memories in the warmth of adventure.
      
      Gather your allies for summer festivals, partake in legendary beach battles, or seek the cooling shade of mysterious forests. Let the spirit of summer invigorate your quests with energy, laughter, and the thrill of discovery.
      
      Stay cool, stay hydrated, and dive into the multitude of adventures that await you under the summer sky. Whether you're battling sea monsters or lounging at a beachside tavern, make this summer a tale to remember!
      
      Wishing you sunny days and starlit nights,
      - The Definya Team
      
      @everyone`;

      await this.discordBot.sendMessageWithColor(
        message,
        "announcements",
        "Happy Summer",
        "Purple",
        "https://i.imgur.com/Vq6k2q1.png"
      );
    } catch (error) {
      console.error(error);
    }
  }

  private async sendHalloweenCronJob(): Promise<void> {
    try {
      const message = `🎃 **Happy Halloween, Denizens of Definya!**

      As the moon rises on this eerie night, the realm of Definya transforms into a land of mystery and fright. Join us in celebrating the spookiest time of the year, where ghouls roam, witches fly, and the veil between worlds grows thin.
      
      Dress in your most terrifying attire and partake in ghostly quests and haunted expeditions. Collect cursed items, brew sinister potions, or venture into the darkest dungeons for a scream and a laugh.
      
      Share your spooky tales and creepy conquests with fellow adventurers. Let's revel in the thrills and chills, making this Halloween a night of frightful fun and delightful dread.
      
      Beware and be brave, for in the shadows lurk both tricks and treats!
      
      Happy Haunting,
      - The Definya Team
      @everyone
      `;

      await this.discordBot.sendMessageWithColor(
        message,
        "announcements",
        "Happy Halloween",
        "Purple",
        "https://i.imgur.com/Hchoeii.png"
      );
    } catch (error) {
      console.error(error);
    }
  }
}
