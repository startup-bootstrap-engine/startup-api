import { CharacterTradingPriceControl } from "@providers/character/CharacterTradingPriceControl";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(CharacterTradingCrons)
export class CharacterTradingCrons {
  constructor(
    private cronJobScheduler: CronJobScheduler,
    private characterTradingPriceControl: CharacterTradingPriceControl
  ) {}

  public schedule(): void {
    this.cronJobScheduler.uniqueSchedule("character-trading-price-control-cleanup", "0 */6 * * *", async () => {
      await this.characterTradingPriceControl.cleanupOldTradingHistory();
    });
  }
}
