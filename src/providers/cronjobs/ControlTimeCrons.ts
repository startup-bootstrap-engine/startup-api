import { NewRelic } from "@providers/analytics/NewRelic";
import { PeriodOfDay } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { MapControlTime } from "../map/MapControlTime";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(ControlTimeCrons)
export class ControlTimeCrons {
  constructor(
    private mapControlTime: MapControlTime,
    private newRelic: NewRelic,
    private cronJobScheduler: CronJobScheduler
  ) {}

  private async controlTimeTask(time: string, period: PeriodOfDay): Promise<void> {
    await this.mapControlTime.controlTime(time, period);
  }

  public schedule(): void {
    // For testing purposes, we will keep this part of code commented,
    // uncomment and the control time will send one event per minute.
    // nodeCron.schedule("* * * * *", async () => {
    //   await this.mapControlTime.controlTime("06:00", PeriodOfDay.Morning);
    // });
    const schedules = [
      { cron: "0 0 * * *", time: "00:00", period: PeriodOfDay.Morning },
      { cron: "0 1 * * *", time: "03:00", period: PeriodOfDay.Morning },
      { cron: "0 2 * * *", time: "06:00", period: PeriodOfDay.Morning },
      { cron: "0 3 * * *", time: "09:00", period: PeriodOfDay.Afternoon },
      { cron: "0 4 * * *", time: "12:00", period: PeriodOfDay.Afternoon },
      { cron: "0 5 * * *", time: "15:00", period: PeriodOfDay.Afternoon },
      { cron: "0 6 * * *", time: "18:00", period: PeriodOfDay.Night },
      { cron: "0 7 * * *", time: "21:00", period: PeriodOfDay.Night },
      { cron: "0 8 * * *", time: "00:00", period: PeriodOfDay.Morning },
      { cron: "0 9 * * *", time: "03:00", period: PeriodOfDay.Morning },
      { cron: "0 10 * * *", time: "06:00", period: PeriodOfDay.Morning },
      { cron: "0 11 * * *", time: "09:00", period: PeriodOfDay.Afternoon },
      { cron: "0 12 * * *", time: "12:00", period: PeriodOfDay.Afternoon },
      { cron: "0 13 * * *", time: "15:00", period: PeriodOfDay.Afternoon },
      { cron: "0 14 * * *", time: "18:00", period: PeriodOfDay.Night },
      { cron: "0 15 * * *", time: "21:00", period: PeriodOfDay.Night },
      { cron: "0 16 * * *", time: "00:00", period: PeriodOfDay.Morning },
      { cron: "0 17 * * *", time: "03:00", period: PeriodOfDay.Morning },
      { cron: "0 18 * * *", time: "06:00", period: PeriodOfDay.Morning },
      { cron: "0 19 * * *", time: "09:00", period: PeriodOfDay.Afternoon },
      { cron: "0 20 * * *", time: "12:00", period: PeriodOfDay.Afternoon },
      { cron: "0 21 * * *", time: "15:00", period: PeriodOfDay.Afternoon },
      { cron: "0 22 * * *", time: "18:00", period: PeriodOfDay.Night },
      { cron: "0 23 * * *", time: "21:00", period: PeriodOfDay.Night },
    ];

    for (const schedule of schedules) {
      this.cronJobScheduler.uniqueSchedule(`control-time-cron-${schedule.time}`, schedule.cron, async () => {
        await this.controlTimeTask(schedule.time, schedule.period);
      });
    }
  }
}
