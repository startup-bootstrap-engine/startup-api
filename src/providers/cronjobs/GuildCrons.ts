import { GuildCleaner } from "@providers/guild/GuildCleaner";
import { GuildTributeTracker } from "@providers/guild/GuildTributeTracker";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(GuildCrons)
export class GuildCrons {
  constructor(
    private cronJobScheduler: CronJobScheduler,
    private guildTributeTracker: GuildTributeTracker,
    private guildCleaner: GuildCleaner
  ) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("guild-tribute-distribution", "0 */6 * * *", async () => {
      await this.guildTributeTracker.distributeTributeToAllGuilds();
    });

    this.cronJobScheduler.uniqueSchedule("guild-inactivity-cleaner", "0 0 * * *", async () => {
      await this.guildCleaner.removeInactiveMembersFromAllGuilds();
    });
  }
}
