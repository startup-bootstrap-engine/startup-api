import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { container } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IItemUpdate, IItemUpdateAll, ItemSocketEvents, ItemSubType, ItemType } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import _, { random } from "lodash";
import { IPlantItem } from "./data/blueprints/PlantItem";
import { PlantLifeCycle } from "./data/types/PlantTypes";

export const MAXIMUM_HOURS_FOR_GROW: number = 24;
export const MINIMUM_HOURS_FOR_WATERING: number = 3;

interface IPlantGrowthStatus {
  canGrow: boolean;
  canWater: boolean;
}

@provide(PlantGrowth)
export class PlantGrowth {
  constructor(private socketMessaging: SocketMessaging) {}

  @TrackNewRelicTransaction()
  public async updatePlantGrowth(
    plant: IItem,
    character: ICharacter,
    errorMessages: string[] | undefined
  ): Promise<boolean> {
    try {
      if (plant.isDead) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, the plant is already dead.");
        return false;
      }

      const blueprintManager = container.get<BlueprintManager>(BlueprintManager);

      const blueprint = (await blueprintManager.getBlueprint("plants", plant.baseKey)) as IPlantItem;

      const { canGrow, canWater }: IPlantGrowthStatus = this.canPlantGrow(plant);

      if (!canWater) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, the plant is not ready to be watered. Try again in a few hours."
        );
        return false;
      }

      const chance = 75;
      const n = _.random(0, 100);

      if (n >= chance) {
        if (errorMessages) {
          this.socketMessaging.sendErrorMessageToCharacter(
            character,
            errorMessages[random(0, errorMessages.length - 1)]
          );
        }
        return false;
      }

      if (!canGrow && canWater) {
        await Item.updateOne({ _id: plant._id }, { $set: { lastWatering: new Date() } });
        return true;
      }

      const currentGrowthPoints = plant.growthPoints ?? 0;
      const requiredGrowthPoints =
        blueprint.stagesRequirements[plant.currentPlantCycle ?? PlantLifeCycle.Seed].requiredGrowthPoints;

      if (currentGrowthPoints < requiredGrowthPoints) {
        await Item.updateOne(
          { _id: plant._id },
          { $set: { growthPoints: currentGrowthPoints + blueprint.growthFactor, lastWatering: new Date() } }
        );
        return true;
      }

      const nextCycle = this.getNextCycle((plant.currentPlantCycle as PlantLifeCycle) ?? PlantLifeCycle.Seed);

      let updatedGrowthPoints = currentGrowthPoints + blueprint.growthFactor;
      if (plant.currentPlantCycle === PlantLifeCycle.Mature && !blueprint.regrowsAfterHarvest) {
        updatedGrowthPoints = currentGrowthPoints;
      }

      const updatedPlant = await Item.findByIdAndUpdate(
        plant._id,
        {
          $set: {
            growthPoints: updatedGrowthPoints,
            currentPlantCycle: nextCycle,
            lastPlantCycleRun: new Date(),
            lastWatering: new Date(),
            texturePath: blueprint.stagesRequirements[nextCycle]?.texturePath,
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
    const hoursSincePlanted = now.diff(dayjs(plant.createdAt), "hour");

    if (hoursSincePlanted <= MAXIMUM_HOURS_FOR_GROW) {
      return { canGrow: true, canWater: true };
    }

    return { canGrow: false, canWater: true };
  }

  private checkPlantGrowthSinceLastWatering(now: dayjs.Dayjs, plant: IItem): IPlantGrowthStatus {
    const hoursSinceLastWatering = now.diff(dayjs(plant.lastWatering), "hour");

    if (hoursSinceLastWatering > MAXIMUM_HOURS_FOR_GROW) {
      return { canGrow: false, canWater: true };
    }

    if (hoursSinceLastWatering <= MAXIMUM_HOURS_FOR_GROW && hoursSinceLastWatering > MINIMUM_HOURS_FOR_WATERING) {
      return { canGrow: true, canWater: true };
    }

    return { canGrow: false, canWater: false };
  }
}
