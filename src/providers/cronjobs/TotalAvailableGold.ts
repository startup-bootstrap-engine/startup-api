import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(TotalAvailableGold)
export class TotalAvailableGold {
  constructor(private newRelic: NewRelic, private cronJobScheduler: CronJobScheduler) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("total-available-gold", "0 4 * * *", async () => {
      await this.trackTotalAvailableGold();
    });

    this.cronJobScheduler.uniqueSchedule("total-gold-active-characters", "0 5 * * *", async () => {
      await this.totalGoldFromActiveCharacters();
    });
  }

  private async trackTotalAvailableGold(): Promise<void> {
    let totalGold = 0;

    const allGoldCoins = (await Item.find({ key: OthersBlueprint.GoldCoin }).lean().select("_id stackQty")) as IItem[];

    for (const goldCoin of allGoldCoins) {
      const { stackQty } = goldCoin;

      if (stackQty) {
        totalGold += stackQty;
      }
    }

    this.newRelic.trackMetric(
      NewRelicMetricCategory.Count,
      NewRelicSubCategory.Items,
      "TotalAvailableGold",
      Math.round(totalGold)
    );
  }

  private async totalGoldFromActiveCharacters(): Promise<void> {
    const twoWeeksAgo = dayjs().subtract(2, "weeks").toDate();

    const pipeline = [
      {
        $match: {
          updatedAt: { $lte: twoWeeksAgo },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "_id",
          foreignField: "owner",
          as: "ownedItems",
        },
      },
      { $unwind: "$ownedItems" },
      {
        $match: {
          "ownedItems.key": OthersBlueprint.GoldCoin,
        },
      },
      {
        $group: {
          _id: null,
          totalGold: { $sum: "$ownedItems.stackQty" },
        },
      },
    ];

    const [result] = await Character.aggregate(pipeline);

    const totalGold = result ? result.totalGold : 0;

    this.newRelic.trackMetric(
      NewRelicMetricCategory.Count,
      NewRelicSubCategory.Items,
      "TotalGoldFromActiveCharacters",
      totalGold
    );
  }
}
