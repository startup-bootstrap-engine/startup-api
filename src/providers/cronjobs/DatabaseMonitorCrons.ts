import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { MarketplaceItem } from "@entities/ModuleMarketplace/MarketplaceItemModel";
import { NPC } from "@entities/ModuleNPC/NPCModel";
import { ChatLog } from "@entities/ModuleSystem/ChatLogModel";
import { User } from "@entities/ModuleSystem/UserModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(DatabaseMonitorCrons)
export class DatabaseMonitorCrons {
  constructor(private cronJobScheduler: CronJobScheduler, private newRelic: NewRelic) {}

  public schedule(): void {
    // every 12 hrs

    this.cronJobScheduler.uniqueSchedule("database-monitor", "0 0 */12 * *", async () => {
      const users = await User.countDocuments();

      this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.Database, "Users", users);

      const characters = await Character.countDocuments();

      this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.Database, "Characters", characters);

      const npcs = await NPC.countDocuments();

      this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.Database, "NPCs", npcs);

      const totalItems = await Item.countDocuments();

      this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.Database, "TotalItems", totalItems);

      const itemContainers = await ItemContainer.countDocuments();

      this.newRelic.trackMetric(
        NewRelicMetricCategory.Count,
        NewRelicSubCategory.Database,
        "ItemContainers",
        itemContainers
      );

      const chatLogs = await ChatLog.countDocuments();

      this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.Database, "ChatLogs", chatLogs);

      const marketplaceItems = await MarketplaceItem.countDocuments();

      this.newRelic.trackMetric(
        NewRelicMetricCategory.Count,
        NewRelicSubCategory.Database,
        "MarketplaceItems",
        marketplaceItems
      );
    });
  }
}
