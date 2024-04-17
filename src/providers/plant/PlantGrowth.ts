import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { MAXIMUM_MINUTES_FOR_GROW, MINIMUM_MINUTES_FOR_WATERING } from "@providers/constants/FarmingConstants";
import { container } from "@providers/inversify/container";
import { SocketAuth } from "@providers/sockets/SocketAuth";
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

export interface IGrowthInfo {
  growthPoints: number;
  requiredGrowthPoints: number;
}

@provide(PlantGrowth)
export class PlantGrowth {
  constructor(private socketMessaging: SocketMessaging, private socketAuth: SocketAuth) {}

  @TrackNewRelicTransaction()
  public async updatePlantGrowth(plant: IItem, character: ICharacter): Promise<boolean> {
    try {
      if (plant.isDead) {
        this.notifyCharacter(character, "Sorry, the plant is already dead.");
        return false;
      }

      if (!plant.owner) {
        this.notifyCharacter(character, "Sorry, plant is not owned by anyone.");
        return false;
      }

      const ownerCharacter = (await Character.findById(plant.owner).lean()) as ICharacter;

      const blueprint = this.getPlantBlueprint(plant) as IPlantItem;

      const { canGrow, canWater } = this.canPlantGrow(plant);

      if (!this.handleWateringStatus(canWater, character, plant.lastWatering ?? new Date())) {
        return false;
      }

      if (!canGrow && canWater) {
        return await this.updateLastWatering(plant);
      }

      const currentGrowthPoints = plant.growthPoints ?? 0;

      const requiredGrowthPoints =
        blueprint.stagesRequirements[plant.currentPlantCycle ?? PlantLifeCycle.Seed].requiredGrowthPoints;

      const nextGrowthPoints = currentGrowthPoints + blueprint.growthFactor;

      if (nextGrowthPoints < requiredGrowthPoints) {
        const updatedPlant = await this.updateGrowthPoints(plant, nextGrowthPoints, requiredGrowthPoints);

        if (updatedPlant) {
          const itemToUpdate = this.prepareItemToUpdate(updatedPlant);
          await this.notifyCharactersAroundCharacter(ownerCharacter, itemToUpdate);
          return true;
        }
        return false;
      }

      const { updatedGrowthPoints, nextCycle } = this.calculateGrowth(plant, blueprint);

      const updatedPlant = await this.updatePlantData(plant, updatedGrowthPoints, nextCycle, blueprint);

      if (!updatedPlant) {
        console.error("Failed to update plant");
        return false;
      }

      const itemToUpdate = this.prepareItemToUpdate(updatedPlant);
      await this.notifyCharactersAroundCharacter(ownerCharacter, itemToUpdate);

      return true;
    } catch (error) {
      console.error("Error updating plant growth:", error);
      return false;
    }
  }

  private async notifyCharactersAroundCharacter(character: ICharacter, itemToUpdate: IItemUpdate): Promise<void> {
    await this.socketMessaging.sendEventToCharactersAroundCharacter<IItemUpdateAll>(
      character,
      ItemSocketEvents.UpdateAll,
      { items: [itemToUpdate] },
      true
    );
  }

  private async updatePlantData(
    plant: IItem,
    updatedGrowthPoints: number,
    nextCycle: PlantLifeCycle,
    blueprint: IPlantItem
  ): Promise<IItem | null> {
    const texturePath = blueprint.stagesRequirements[nextCycle]?.texturePath;
    const requiredGrowthPoints = blueprint.stagesRequirements[nextCycle]?.requiredGrowthPoints ?? 0;
    if (!texturePath) {
      console.error("Texture path not found for next cycle");
      return null;
    }

    return await Item.findByIdAndUpdate(
      plant._id,
      {
        $set: {
          growthPoints: updatedGrowthPoints,
          currentPlantCycle: nextCycle,
          requiredGrowthPoints,
          lastPlantCycleRun: new Date(),
          lastWatering: new Date(),
          texturePath: texturePath,
        },
      },
      { new: true, lean: { virtuals: true, defaults: true } }
    );
  }

  private async updateGrowthPoints(
    plant: IItem,
    nextGrowthPoints: number,
    requiredGrowthPoints: number
  ): Promise<IItem | null> {
    return await Item.findByIdAndUpdate(
      plant._id,
      {
        $set: {
          growthPoints: nextGrowthPoints,
          requiredGrowthPoints,
          lastWatering: new Date(),
        },
      },
      { new: true, lean: { virtuals: true, defaults: true } }
    );
  }

  private calculateGrowth(
    plant: IItem,
    blueprint: IPlantItem
  ): { updatedGrowthPoints: number; nextCycle: PlantLifeCycle } {
    const currentGrowthPoints = plant.growthPoints ?? 0;
    const requiredGrowthPoints = this.getRequiredGrowthPoints(plant, blueprint);

    if (currentGrowthPoints < requiredGrowthPoints) {
      return {
        updatedGrowthPoints: currentGrowthPoints + blueprint.growthFactor,
        nextCycle: (plant.currentPlantCycle as PlantLifeCycle) ?? PlantLifeCycle.Seed,
      };
    }

    const nextCycle = this.getNextCycle((plant.currentPlantCycle as PlantLifeCycle) ?? PlantLifeCycle.Seed);
    let updatedGrowthPoints = currentGrowthPoints + blueprint.growthFactor;
    if (plant.currentPlantCycle === PlantLifeCycle.Mature && !blueprint.regrowsAfterHarvest) {
      updatedGrowthPoints = currentGrowthPoints; // Plant does not regrow, keep current growth points
    }

    return { updatedGrowthPoints, nextCycle };
  }

  public getGrowthInfo(plant: IItem): {
    growthPoints: number;
    requiredGrowthPoints: number;
  } {
    return {
      growthPoints: plant?.growthPoints ?? 0,
      requiredGrowthPoints: this.getRequiredGrowthPoints(plant, this.getPlantBlueprint(plant) as IPlantItem),
    };
  }

  private getRequiredGrowthPoints(plant: IItem, blueprint: IPlantItem): number {
    return blueprint.stagesRequirements[plant.currentPlantCycle ?? PlantLifeCycle.Seed].requiredGrowthPoints;
  }

  private async updateLastWatering(plant: IItem): Promise<boolean> {
    await Item.updateOne({ _id: plant._id }, { $set: { lastWatering: new Date() } });
    return true;
  }

  private handleWateringStatus(canWater: boolean, character: ICharacter, lastWatering: Date): boolean {
    if (!canWater) {
      const remainingMinutesToWater = MINIMUM_MINUTES_FOR_WATERING - dayjs().diff(dayjs(lastWatering), "minute");

      this.notifyCharacter(
        character,
        `Sorry, the plant is not ready to be watered. Try again in ${remainingMinutesToWater} minutes.`
      );
      return false;
    }
    return true;
  }

  private notifyCharacter(character: ICharacter, message: string): void {
    this.socketMessaging.sendErrorMessageToCharacter(character, message);
  }

  private getPlantBlueprint(plant: IItem): IPlantItem | null {
    try {
      const blueprintManager = container.get(BlueprintManager);

      return blueprintManager.getBlueprint("plants", plant.key) as IPlantItem;
    } catch (error) {
      console.error("Failed to get plant blueprint:", error);
      return null;
    }
  }

  private prepareItemToUpdate(item: IItem): IItemUpdate {
    const itemBlueprint = this.getPlantBlueprint(item);

    if (!itemBlueprint) {
      throw new Error(`Failed to get blueprint for item ${item.baseKey}`);
    }

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
      growthPoints: item.growthPoints!,
      requiredGrowthPoints: this.getRequiredGrowthPoints(item, itemBlueprint),
      isTileTinted: item.isTileTinted,
      isDead: item.isDead,
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

    const result = cycleOrder[currentIndex + 1] || currentCycle;

    return result;
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

    await this.warnOwnersAboutWateringTime(plantsNeedingUpdate);

    // Update the tinted tile status for all plants that need to be updated
    await this.bulkUpdateTintedTileStatus(plantsNeedingUpdate);

    const updatedPlants = (await Item.find({
      _id: { $in: plantsNeedingUpdate.map((plant) => plant._id) },
    }).lean()) as IItem[];

    // Update the texture for each plant that needs to be updated
    await Promise.all(updatedPlants.map((plant) => this.updatePlantTexture(plant)));
  }

  private async warnOwnersAboutWateringTime(plantsNeedingUpdate: IItem[]): Promise<void> {
    const ownerIds = plantsNeedingUpdate.map((plant) => plant.owner);
    const uniqueOwnerIds = [...new Set(ownerIds)];
    const owners: ICharacter[] = await Character.find({
      _id: { $in: uniqueOwnerIds },
    });

    for (const owner of owners) {
      this.socketMessaging.sendErrorMessageToCharacter(owner, "🌱 Your plants need to be watered.");
    }
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
