import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { DEAD_PLANT_REMOVE_HOURS, MAX_HOURS_NO_WATER_DEAD } from "@providers/constants/FarmingConstants";
import { container } from "@providers/inversify/container";
import { ItemType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { PlantGrowth } from "./PlantGrowth";
import { IPlantItem } from "./data/blueprints/PlantItem";

@provide(PlantDead)
export class PlantDead {
  constructor(private plantGrowth: PlantGrowth) {}

  @TrackNewRelicTransaction()
  public async checkUpdateDeadPlants(): Promise<void> {
    const blueprintManager = container.get<BlueprintManager>(BlueprintManager);
    const thresholdDate = new Date(Date.now() - MAX_HOURS_NO_WATER_DEAD * 60 * 60 * 1000);

    const deadPlants = await this.findDeadPlants(thresholdDate);

    const updatePromises = deadPlants.map((plant) => this.updateDeadPlant(plant, blueprintManager));
    await Promise.all(updatePromises);
  }

  private async findDeadPlants(thresholdDate: Date): Promise<IItem[]> {
    const queryResult = await Item.find({
      type: ItemType.Plant,
      $or: [{ isDead: false }, { isDead: { $exists: false } }],
      $and: [
        {
          $or: [
            { lastWatering: { $lt: thresholdDate } },
            {
              $and: [{ lastWatering: { $exists: false } }, { createdAt: { $lt: thresholdDate } }],
            },
          ],
        },
      ],
    }).lean<IItem[]>({ virtuals: true, defaults: true });

    return queryResult;
  }

  @TrackNewRelicTransaction()
  private async updateDeadPlant(plant: IItem, blueprintManager: BlueprintManager): Promise<void> {
    const blueprint = (await blueprintManager.getBlueprint("plants", plant.baseKey)) as IPlantItem;

    const updatedPlant = await Item.findOneAndUpdate(
      { _id: plant._id },
      { $set: { isDead: true, texturePath: blueprint.deadTexturePath, timeOfDeath: new Date() } },
      { new: true }
    ).exec();

    await this.plantGrowth.updatePlantTexture(updatedPlant as IItem);
  }

  @TrackNewRelicTransaction()
  public async removeDeadPlants(): Promise<void> {
    const thresholdDate = new Date(Date.now() - DEAD_PLANT_REMOVE_HOURS * 60 * 60 * 1000);

    const removingPlants = await Item.find({
      type: ItemType.Plant,
      isDead: true,
      timeOfDeath: { $lt: thresholdDate },
    });

    const removePromises = removingPlants.map((plant) => plant.remove());
    await Promise.all(removePromises);
  }
}
