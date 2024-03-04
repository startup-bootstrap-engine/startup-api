import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { MAXIMUM_MINUTES_FOR_GROW, MINIMUM_MINUTES_FOR_WATERING } from "@providers/constants/FarmingConstants";
import { container } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IItemUpdate, IItemUpdateAll, ItemSocketEvents, ItemSubType, ItemType } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { IPlantItem } from "./data/blueprints/PlantItem";
import { PlantLifeCycle } from "./data/types/PlantTypes";

interface IPlantGrowthStatus {
  canGrow: boolean;
  canWater: boolean;
}

@provide(PlantGrowth)
export class PlantGrowth {
  constructor(private socketMessaging: SocketMessaging) {}

  @TrackNewRelicTransaction()
  public async updatePlantGrowth(plant: IItem, character: ICharacter): Promise<boolean> {
    try {
      if (plant.isDead) {
        // this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, the plant is already dead.");

        this.notifyCharacter(character, "Sorry, the plant is already dead.");
        return false;
      }

      const blueprint = (await this.getPlantBlueprint(plant)) as IPlantItem;

      const { canGrow, canWater }: IPlantGrowthStatus = this.canPlantGrow(plant);

      console.log("canPlantGrow", canGrow, canWater);

      if (!canWater) {
        this.notifyCharacter(character, "Sorry, the plant is not ready to be watered. Try again in a few minutes.");

        return false;
      }

      if (!canGrow && canWater) {
        await Item.updateOne({ _id: plant._id }, { $set: { lastWatering: new Date() } });
        return true;
      }

      const currentGrowthPoints = plant.growthPoints ?? 0;
      const requiredGrowthPoints =
        blueprint.stagesRequirements[plant.currentPlantCycle ?? PlantLifeCycle.Seed].requiredGrowthPoints;

      console.log("currentGrowthPoints", currentGrowthPoints);
      console.log("requiredGrowthPoints", requiredGrowthPoints);

      if (currentGrowthPoints < requiredGrowthPoints) {
        console.log("Not enough growth points to grow yet");
        await Item.updateOne(
          { _id: plant._id },
          { $set: { growthPoints: currentGrowthPoints + blueprint.growthFactor, lastWatering: new Date() } }
        );
        return true;
      }

      const nextCycle = this.getNextCycle((plant.currentPlantCycle as PlantLifeCycle) ?? PlantLifeCycle.Seed);

      console.log("nextCycle", nextCycle);

      let updatedGrowthPoints = currentGrowthPoints + blueprint.growthFactor;
      if (plant.currentPlantCycle === PlantLifeCycle.Mature && !blueprint.regrowsAfterHarvest) {
        console.log("Plant is mature and does not regrow after harvest");
        updatedGrowthPoints = currentGrowthPoints;
      }

      const texturePath = blueprint.stagesRequirements?.[nextCycle]?.texturePath;

      if (!texturePath) {
        console.error("Texture path not found for next cycle");
        return false;
      }

      console.log("Updating plant growth", updatedGrowthPoints, nextCycle, new Date(), texturePath);

      const updatedPlant = await Item.findByIdAndUpdate(
        plant._id,
        {
          $set: {
            growthPoints: updatedGrowthPoints,
            currentPlantCycle: nextCycle,
            lastPlantCycleRun: new Date(),
            lastWatering: new Date(),
            texturePath: texturePath,
          },
        },
        {
          new: true,
          lean: { virtuals: true, defaults: true },
        }
      );

      // Verifying if update was successful
      if (!updatedPlant) {
        console.error("Failed to update plant");
        return false;
      }

      const itemToUpdate = this.prepareItemToUpdate(updatedPlant);

      if (plant.owner) {
        const character = (await Character.findById(plant.owner).lean()) as ICharacter;
        if (character) {
          await this.socketMessaging.sendEventToCharactersAroundCharacter<IItemUpdateAll>(
            character,
            ItemSocketEvents.UpdateAll,
            { items: [itemToUpdate] },
            true
          );
        } else {
          console.error("Character not found");
        }
      }

      return true;
    } catch (error) {
      console.error("Error updating plant growth:", error);
      return false;
    }
  }

  private notifyCharacter(character: ICharacter, message: string): void {
    this.socketMessaging.sendErrorMessageToCharacter(character, message);
  }

  private async getPlantBlueprint(plant: IItem): Promise<IPlantItem | null> {
    const blueprintManager = container.get<BlueprintManager>(BlueprintManager);
    try {
      return (await blueprintManager.getBlueprint("plants", plant.baseKey)) as IPlantItem;
    } catch (error) {
      console.error("Failed to get plant blueprint:", error);
      return null;
    }
  }

  private prepareItemToUpdate(item: IItem): IItemUpdate {
    return {
      id: item._id,
      texturePath: item.texturePath,
      textureAtlas: item.textureAtlas,
      type: item.type as ItemType,
      subType: item.subType as ItemSubType,
      name: item.name,
      x: item.x!,
      y: item.y!,
      layer: item.layer!,
      stackQty: item.stackQty || 0,
      isDeadBodyLootable: item.isDeadBodyLootable,
      lastWatering: item.lastWatering!,
    };
  }

  public async updatePlantTexture(plant: IItem): Promise<void> {
    const itemToUpdate = this.prepareItemToUpdate(plant);

    if (plant.owner) {
      const character = (await Character.findById(plant.owner).lean()) as ICharacter;
      if (character) {
        await this.socketMessaging.sendEventToCharactersAroundCharacter<IItemUpdateAll>(
          character,
          ItemSocketEvents.UpdateAll,
          { items: [itemToUpdate] },
          true
        );
      } else {
        console.error("Character not found");
      }
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

  private canPlantGrow(plant: IItem): IPlantGrowthStatus {
    const now = dayjs();

    if (!plant.lastWatering) {
      return this.checkPlantGrowthSincePlanted(now, plant);
    }

    return this.checkPlantGrowthSinceLastWatering(now, plant);
  }

  private checkPlantGrowthSincePlanted(now: dayjs.Dayjs, plant: IItem): IPlantGrowthStatus {
    const minutesSincePlanted = now.diff(dayjs(plant.createdAt), "minute");

    if (minutesSincePlanted <= MAXIMUM_MINUTES_FOR_GROW) {
      return { canGrow: true, canWater: true };
    }

    return { canGrow: false, canWater: true };
  }

  private checkPlantGrowthSinceLastWatering(now: dayjs.Dayjs, plant: IItem): IPlantGrowthStatus {
    const minutesSinceLastWatering = now.diff(dayjs(plant.lastWatering), "minute");

    if (minutesSinceLastWatering > MAXIMUM_MINUTES_FOR_GROW) {
      return { canGrow: false, canWater: true };
    }

    if (
      minutesSinceLastWatering <= MAXIMUM_MINUTES_FOR_GROW &&
      minutesSinceLastWatering >= MINIMUM_MINUTES_FOR_WATERING
    ) {
      return { canGrow: true, canWater: true };
    }

    return { canGrow: false, canWater: false };
  }

  public async checkAndUpdateTintedTilePlants(): Promise<void> {
    // Calculate the time before which plants should have been watered
    // If a plant was last watered before this time, it needs to be updated
    const wateringCutoffTime = dayjs().subtract(MINIMUM_MINUTES_FOR_WATERING, "minute").toDate();

    // Find all plants that need to be updated
    // These are plants of type 'Plant', that have a tinted tile, and were last watered before the cutoff time
    const plantsNeedingUpdate = await Item.find({
      type: ItemType.Plant,
      isTileTinted: true,
      lastWatering: { $lt: wateringCutoffTime },
    }).lean<IItem[]>({ virtuals: true, defaults: true });

    // Update the tinted tile status for all plants that need to be updated
    await this.bulkUpdateTintedTileStatus(plantsNeedingUpdate);

    console.log("Number of plants to be updated", plantsNeedingUpdate.length);

    // Update the texture for each plant that needs to be updated
    await Promise.all(plantsNeedingUpdate.map((plant) => this.updatePlantTexture(plant)));
  }

  private async bulkUpdateTintedTileStatus(plants: IItem[]): Promise<void> {
    const ids = plants.map((plant) => plant._id);
    const bulkUpdateOps = ids.map((id) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { isTileTinted: false } },
      },
    }));

    // Execute bulk operation
    await Item.bulkWrite(bulkUpdateOps);
  }
}
