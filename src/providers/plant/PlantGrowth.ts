import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { ItemType } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { IPlantItem } from "./data/blueprints/PlantItem";
import { PlantLifeCycle } from "./data/types/PlantTypes";

@provide(PlantGrowth)
export class PlantGrowth {
  constructor(private blueprintManager: BlueprintManager) {}

  @TrackNewRelicTransaction()
  public async updatePlantGrowth(): Promise<void> {
    try {
      // Fetch all plants
      const plants = (await Item.find({ type: ItemType.Plant }).lean({
        virtuals: true,
        defaults: true,
      })) as IItem[];

      for (const plant of plants) {
        const blueprint = (await this.blueprintManager.getBlueprint("plants", plant.baseKey)) as IPlantItem;

        if (!this.canPlantGrow(plant, blueprint)) {
          continue; // Skip to the next iteration if the plant cannot grow
        }

        const currentGrowthPoints = plant.growthPoints ?? 0;
        const requiredGrowthPoints =
          blueprint.stagesRequirements[plant.currentPlantCycle ?? PlantLifeCycle.Seed].requiredGrowthPoints;

        if (currentGrowthPoints < requiredGrowthPoints) {
          await Item.updateOne({ _id: plant._id }, { $set: { growthPoints: currentGrowthPoints + 1 } });
          continue;
        }

        const nextCycle = this.getNextCycle((plant.currentPlantCycle as PlantLifeCycle) ?? PlantLifeCycle.Seed);

        let updatedGrowthPoints = currentGrowthPoints + 1;
        if (plant.currentPlantCycle === PlantLifeCycle.Mature && !blueprint.regrowsAfterHarvest) {
          updatedGrowthPoints = currentGrowthPoints;
        }

        const now = new Date();
        await Item.updateOne(
          { _id: plant._id },
          { $set: { growthPoints: updatedGrowthPoints, currentPlantCycle: nextCycle, lastPlantCycleRun: now } }
        );
      }
    } catch (error) {
      console.error("Error updating plant growth:", error);
    }
  }

  private getNextCycle(currentCycle: PlantLifeCycle): PlantLifeCycle {
    if (currentCycle === PlantLifeCycle.Mature) {
      // Remain as Harvestable if it's not harvested.
      // In harvesting code it should change it to Sprout if regrowsAfterHarvest true
      return PlantLifeCycle.Mature;
    }

    const cycleOrder = [PlantLifeCycle.Seed, PlantLifeCycle.Sprout, PlantLifeCycle.Young, PlantLifeCycle.Mature];

    const currentIndex = cycleOrder.indexOf(currentCycle);
    return cycleOrder[currentIndex + 1] || currentCycle;
  }

  private canPlantGrow(plant: IItem, blueprint: IPlantItem): boolean {
    const now = dayjs();

    // Check if the plant has been watered at least once
    if (!plant.lastWatering) {
      return false;
    }

    const minutesSinceLastWatering = now.diff(dayjs(plant.lastWatering), "minute");

    // Check if the last watering was more than 30 minutes ago
    if (minutesSinceLastWatering > 30) {
      return false;
    }

    // Check if the last plant cycle run was less than 15 minutes ago
    const minutesSinceLastRun = now.diff(dayjs(plant.lastPlantCycleRun), "minute");
    if (plant.lastPlantCycleRun && minutesSinceLastRun < 15) {
      return false;
    }

    // Check if the plant was watered after the last update
    const lastPlantCycleRunDate = dayjs(plant.lastPlantCycleRun);
    const lastWateringDate = dayjs(plant.lastWatering);
    if (plant.lastPlantCycleRun && lastWateringDate.isBefore(lastPlantCycleRunDate)) {
      return false;
    }

    return true;
  }
}
