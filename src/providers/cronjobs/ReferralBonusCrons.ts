import { Item } from "@entities/ModuleInventory/ItemModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(ReferralBonusCrons)
export class ReferralBonusCrons {
  constructor(private cronJobScheduler: CronJobScheduler, private newRelic: NewRelic) {}

  public schedule(): void {
    // every 12 hrs
    this.cronJobScheduler.uniqueSchedule("social-crystal-count", "0 */12 * * *", async () => {
      const result = await Item.aggregate([
        { $match: { key: CraftingResourcesBlueprint.SocialCrystal } },
        { $group: { _id: null, total: { $sum: "$stackQty" } } },
      ]);

      const totalSocialCrystals = result.length > 0 ? result[0].total : 0;

      this.newRelic.trackMetric(
        NewRelicMetricCategory.Count,
        NewRelicSubCategory.Items,
        "SocialCrystal",
        totalSocialCrystals
      );
    });
  }
}
