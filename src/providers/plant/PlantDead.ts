import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { MAX_HOURS_NO_WATER_DEAD } from "@providers/constants/FarmingConstants";
import { container } from "@providers/inversify/container";
import { ItemType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { PlantGrowth } from "./PlantGrowth";
import { IPlantItem } from "./data/blueprints/PlantItem";

@provide(PlantDead)
export class PlantDead {
  constructor(private plantGrowth: PlantGrowth) {}

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

  private async updateDeadPlant(plant: IItem, blueprintManager: BlueprintManager): Promise<void> {
    const blueprint = (await blueprintManager.getBlueprint("plants", plant.baseKey)) as IPlantItem;

    const updatedPlant = await Item.findOneAndUpdate(
      { _id: plant._id },
      { $set: { isDead: true, texturePath: blueprint.deadTexturePath } },
      { new: true }
    ).exec();

    await this.plantGrowth.updatePlantTexture(updatedPlant as IItem);
  }
}
