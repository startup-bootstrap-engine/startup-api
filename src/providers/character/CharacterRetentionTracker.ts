import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";

@provide(CharacterRetentionTracker)
export class CharacterRetentionTracker {
  constructor(private newRelic: NewRelic) {}

  public async trackMedianTotalDaysPlayed(): Promise<void> {
    const oneWeekAgo = dayjs().subtract(7, "day").toDate();

    const characters = await Character.find({
      totalDaysPlayed: { $exists: true },
      updatedAt: { $gte: oneWeekAgo },
    }).lean();

    const totalDaysPlayedArray = characters.map((character) => character.totalDaysPlayed);

    // Calculate the median
    const medianTotalDaysPlayed = this.calculateMedian(totalDaysPlayedArray);

    // Track the median using New Relic
    this.newRelic.trackMetric(
      NewRelicMetricCategory.Time,
      NewRelicSubCategory.Characters,
      "MedianTotalDaysPlayed",
      medianTotalDaysPlayed
    );
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
  }
}
