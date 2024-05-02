import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IUseWithTileValidation, UseWithSocketEvents } from "@rpg-engine/shared";
import { ItemType } from "@rpg-engine/shared/dist/types/item.types";
import { provide } from "inversify-binding-decorators";
import { PlantGrowth } from "./PlantGrowth";

@provide(WateringByRain)
export class WateringByRain {
  constructor(private plantGrowth: PlantGrowth, private socketMessaging: SocketMessaging) {}

  public async wateringPlants(): Promise<void> {
    try {
      const plants = await Item.find({
        type: ItemType.Plant,
        $or: [{ isDead: false }, { isDead: { $exists: false } }],
      }).lean<IItem[]>({ virtuals: true, defaults: true });

      if (plants) {
        for (const plant of plants) {
          await this.updatePlant(plant);
        }
      }
    } catch (error) {
      console.error("Error while watering plants in rain:", error);
    }
  }

  public async updatePlant(plant: IItem): Promise<void> {
    try {
      const isSuccess = await this.plantGrowth.updatePlantGrowth(plant);
      if (isSuccess) {
        this.socketMessaging.sendEventToAllUsers<IUseWithTileValidation>(UseWithSocketEvents.UseWithWater, {
          status: true,
        });

        await Item.updateOne({ _id: plant._id }, { $set: { isTileTinted: true } });
      }
    } catch (error) {
      console.error("Error while updating plant in rain:", error);
    }
  }
}
