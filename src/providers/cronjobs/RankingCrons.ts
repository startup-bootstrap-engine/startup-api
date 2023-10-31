import { DiscordBot } from "@providers/discord/DiscordBot";
import { RankingGetInfo } from "@providers/ranking/RankingGetInfo";

import { Colors } from "discord.js";

import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(RankingCrons)
export class RankingCrons {
  constructor(
    private discordBot: DiscordBot,
    private cronJobScheduler: CronJobScheduler,
    private rankingGetInfo: RankingGetInfo
  ) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("ranking-crons", "0 2 */3 * *", async () => {
      await this.topLevelGlobal();
      await this.topLevelClass();
      await this.topLevelBySkillType();
    });
  }

  private async topLevelGlobal(): Promise<void> {
    const result = await this.rankingGetInfo.topLevelGlobal();

    let message = "";
    let index = 1;

    result.forEach((char) => {
      if (index <= 10) {
        message += `${index}- Name: [${char.name}] - Level: [${Math.round(char.level)}] \n`;
        index++;
      }
    });

    const title = "Top 10 Global Level!";

    await this.discordBot.sendMessageWithColor(message, "rankings", title, Colors.Purple);
  }

  private async topLevelClass(): Promise<void> {
    const result = this.rankingGetInfo.topLevelClass();

    for (const rank of Object.values(result)) {
      let message = "";
      const title = `Top 10 ${rank.class}!`;

      rank.topPlayers.forEach((char, index) => {
        message += `${index + 1}- Name: [${char.name}] - Level: [${Math.round(char.level)}]\n`;
      });

      await this.discordBot.sendMessageWithColor(message, "rankings", title, Colors.Gold);
    }
  }

  private async topLevelBySkillType(): Promise<void> {
    const top10ForAllSkills = await this.rankingGetInfo.topLevelBySkillType();

    for (const ranking of top10ForAllSkills) {
      let message = "";

      ranking.top10.sort((a, b) => b.level - a.level);

      const title = `Top 10 ${ranking.skill.charAt(0).toUpperCase() + ranking.skill.slice(1)} Skill!`;
      ranking.top10.forEach((char, index) => {
        message += `${index + 1}- Name: [${char.name}] - Level: [${char.level}]\n`;
      });

      await this.discordBot.sendMessageWithColor(message, "rankings", title, Colors.Aqua);
    }
  }
}
