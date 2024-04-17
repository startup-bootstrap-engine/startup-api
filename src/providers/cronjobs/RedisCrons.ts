import { RedisManager } from "@providers/database/RedisManager";
import { RedisClientConnectionManager } from "@providers/database/RedisManager/RedisClientConnectionManager";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(RedisCrons)
export class RedisCrons {
  constructor(
    private cronJobScheduler: CronJobScheduler,
    private redisManager: RedisManager,
    private redisConnectionManager: RedisClientConnectionManager
  ) {}

  public schedule(): void {
    // every 5 minutes
    this.cronJobScheduler.uniqueSchedule("redis-client-connection-count", "* * * * *", async () => {
      await this.redisConnectionManager.printTotalConnectedClients(this.redisManager.client!);
    });
  }
}
