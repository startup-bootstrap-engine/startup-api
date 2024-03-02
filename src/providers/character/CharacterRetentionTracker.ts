import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";

@provide(CharacterRetentionTracker)
export class CharacterRetentionTracker {
  constructor(private newRelic: NewRelic) {}

  public async trackAverageTotalDaysPlayed(): Promise<void> {
    const twoWeeksAgo = dayjs().subtract(14, "day").toDate();

    const result = await Character.aggregate([
      {
        $match: {
          updatedAt: { $gte: twoWeeksAgo },
        },
      },
      {
        $group: {
          _id: null,
          averageTotalDaysPlayed: { $avg: "$totalDaysPlayed" },
        },
      },
    ]);

    const averageTotalDaysPlayed = result[0]?.averageTotalDaysPlayed || 0;

    // Track the median using New Relic
    this.newRelic.trackMetric(
      NewRelicMetricCategory.Time,
      NewRelicSubCategory.Characters,
      "averageTotalDaysPlayed2Weeks",
      averageTotalDaysPlayed
    );
  }
}
