import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { provide } from "inversify-binding-decorators";
import { PlantLoader } from "./PlantLoader";

@provide(PlantSeeder)
export class PlantSeeder {
  constructor(private plantLoader: PlantLoader) {}

  @TrackNewRelicTransaction()
  public async seed(): Promise<void> {
    const plantSeedData = await this.plantLoader.loadPlantSeedData();

    for (const [key, plantData] of plantSeedData) {
      const plantFound = (await Item.findOne({ tiledId: plantData.tiledId }).lean({
        virtuals: true,
        defaults: true,
      })) as unknown as IItem;

      if (!plantFound) {
        const newPlant = new Item({
          ...plantData,
        });
        await newPlant.save();
      } else {
        await Item.updateOne(
          {
            key: key,
          },
          { ...plantData },
          { upsert: true }
        );
      }
    }
  }
}
