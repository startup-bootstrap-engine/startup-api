import { PlantGrowth } from "@providers/plant/PlantGrowth";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(PlantCycleCrons)
export class PlantCycleCrons {
  constructor(private plantGrowth: PlantGrowth, private cronJobScheduler: CronJobScheduler) {}

  public schedule(): void {
    // once every 1 minute
    this.cronJobScheduler.uniqueSchedule("plant-growth-cron", "* * * * *", async () => {
      await this.plantGrowth.updatePlantGrowth();
    });
  }
}
