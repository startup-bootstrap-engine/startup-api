import { MarketplaceCleaner } from "@providers/marketplace/MarketplaceCleaner";
import { MarketplaceTracker } from "@providers/marketplace/MarketplaceTracker";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(MarketplaceCrons)
export class MarketplaceCrons {
  constructor(
    private marketplaceCleaner: MarketplaceCleaner,
    private marketplaceTracker: MarketplaceTracker,
    private cronJobScheduler: CronJobScheduler
  ) {}

  public schedule(): void {
    // once per week, monday at midnight
    this.cronJobScheduler.uniqueSchedule("marketplace-cron-rollback-items", "0 0 * * 1", async () => {
      await this.marketplaceCleaner.rollbackItemsAfterCertainPeriod();
    });

    // once per week, friday, at midnight
    this.cronJobScheduler.uniqueSchedule("marketplace-cron-delete-items-inactive-characters", "0 0 * * 5", async () => {
      await this.marketplaceCleaner.deleteItemsFromInactiveCharacters();
    });

    // once per day, at midnight
    this.cronJobScheduler.uniqueSchedule("marketplace-cron-track-qty-of-listed-items", "0 */12 * * *", async () => {
      await this.marketplaceTracker.trackQtyOfListedItems();
    });

    this.cronJobScheduler.uniqueSchedule(
      "marketplace-cron-track-median-price-of-listed-items",
      "0 */12 * * *",
      async () => {
        await this.marketplaceTracker.trackMedianPriceOfListedItems();
      }
    );
  }
}
