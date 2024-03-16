import { MarketplaceItem } from "@entities/ModuleMarketplace/MarketplaceItemModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { provide } from "inversify-binding-decorators";
import * as statistics from "simple-statistics";

@provide(MarketplaceTracker)
export class MarketplaceTracker {
  constructor(private newRelic: NewRelic) {}

  public async trackQtyOfListedItems(): Promise<void> {
    const total = await MarketplaceItem.countDocuments({});

    if (total === 0) {
      return;
    }

    this.newRelic.trackMetric(
      NewRelicMetricCategory.Count,
      NewRelicSubCategory.Marketplace,
      "MarketplaceTotalItemsListed",
      total
    );
  }

  public async trackMedianPriceOfListedItems(): Promise<void> {
    const docs = await MarketplaceItem.find({}, "price").lean().exec();
    const prices = docs.map((doc) => doc.price);

    if (prices.length === 0) {
      return;
    }

    const median = statistics.median(prices);

    this.newRelic.trackMetric(
      NewRelicMetricCategory.Count,
      NewRelicSubCategory.Marketplace,
      "MarketplaceMedianPrice",
      median
    );
  }
}
