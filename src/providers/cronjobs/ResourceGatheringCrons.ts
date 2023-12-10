import { UseWithTileExhaustionControl } from "@providers/useWith/abstractions/UseWithTileExhaustionControl";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(ResourceGatheringCrons)
export class ResourceGatheringCrons {
  constructor(
    private cronJobScheduler: CronJobScheduler,
    private useWithTileExhaustion: UseWithTileExhaustionControl
  ) {}

  public schedule(): void {
    // every 10 minutes
    this.cronJobScheduler.uniqueSchedule("resource-gathering-cron-job", "* * * * *", async () => {
      await this.useWithTileExhaustion.checkAndExpireTiles();
    });
  }
}
