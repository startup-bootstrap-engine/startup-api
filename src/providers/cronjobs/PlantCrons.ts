import { PlantDead } from "@providers/plant/PlantDead";
import { PlantGrowth } from "@providers/plant/PlantGrowth";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(PlantCrons)
export class PlantCrons {
  constructor(
    private cronJobScheduler: CronJobScheduler,
    private plantDead: PlantDead,
    private plantGrowth: PlantGrowth
  ) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("plant-dead-cron", "0 */6 * * *", async () => {
      await this.plantDead.checkUpdateDeadPlants();
    });

    this.cronJobScheduler.uniqueSchedule("remove-dead-plant-cron", "0,30 * * * *", async () => {
      await this.plantDead.removeDeadPlants();
    });

    this.cronJobScheduler.uniqueSchedule("plant-tile-tint-cron", "* * * * *", async () => {
      console.log("Checking and updating tinted tile plants");
      await this.plantGrowth.checkAndUpdateTintedTilePlants();
    });
  }
}
