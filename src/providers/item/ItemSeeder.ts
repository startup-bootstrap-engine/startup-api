import { Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { IItem } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { ItemLoader } from "./ItemLoader";

@provide(ItemSeeder)
export class ItemSeeder {
  constructor(private itemLoader: ItemLoader) {}

  @TrackNewRelicTransaction()
  public async seed(): Promise<void> {
    const itemSeedData = await this.itemLoader.loadItemSeedData();

    for (const [key, itemData] of itemSeedData) {
      const itemFound = (await Item.findOne({ tiledId: itemData.tiledId }).lean({
        virtuals: true,
        defaults: true,
      })) as unknown as IItem;

      if (!itemFound) {
        // console.log(`🌱 Seeding database with Item data for Item with key: ${itemData.key}`);

        const newItem = new Item({
          ...itemData,
        });
        // eslint-disable-next-line mongoose-lean/require-lean
        await newItem.save();
      } else {
        // console.log(`🗡️ Updating Item ${itemData.key} database data...`);

        await Item.updateOne(
          {
            key: key,
          },
          { ...itemData },
          { upsert: true }
        );
      }
    }
  }
}
