import { PlantDead } from "@providers/plant/PlantDead";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(PlantCrons)
export class PlantCrons {
  constructor(private cronJobScheduler: CronJobScheduler, private plantDead: PlantDead) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("plant-dead-cron", "0 */6 * * *", async () => {
      await this.plantDead.checkUpdateDeadPlants();
    });
  }
}
