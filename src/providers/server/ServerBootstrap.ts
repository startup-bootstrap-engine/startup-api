import { PushNotificationHelper } from "@providers/pushNotification/PushNotificationHelper";
import { Seeder } from "@providers/seeds/Seeder";

import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { cache } from "@providers/constants/CacheConstants";
import { DiscordBot } from "@providers/discord/DiscordBot";
import { ErrorHandlingTracker } from "@providers/errorHandling/ErrorHandlingTracker";
import { Locker } from "@providers/locks/Locker";
import { MessagingBroker } from "@providers/microservice/messaging-broker/MessagingBrokerMessaging";
import { ResultsPoller } from "@providers/poller/ResultsPoller";
import { QueueActivityMonitor } from "@providers/queue/QueueActivityMonitor";
import { RabbitMQ } from "@providers/rabbitmq/RabbitMQ";
import { RedisPubSub } from "@providers/redis/RedisPubSub";
import { RedisStreams } from "@providers/redis/RedisStreams";
import { SocketSessionControl } from "@providers/sockets/SocketSessionControl";
import { Cooldown } from "@providers/time/Cooldown";
import { EnvType } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";
import { PM2Helper } from "./PM2Helper";

@provide(ServerBootstrap)
export class ServerBootstrap {
  constructor(
    private pm2Helper: PM2Helper,
    private seeder: Seeder,
    private locker: Locker,
    private discordBot: DiscordBot,
    private socketSessionControl: SocketSessionControl,
    private errorHandlingTracker: ErrorHandlingTracker,
    private queueActivityMonitor: QueueActivityMonitor,

    private cooldown: Cooldown,
    private resultsPoller: ResultsPoller,
    private messagingBroker: MessagingBroker,
    private redisPubSub: RedisPubSub,
    private redisStreams: RedisStreams,
    private rabbitMQ: RabbitMQ
  ) {}

  // operations that can be executed in only one CPU instance without issues with pm2 (ex. setup centralized state doesnt need to be setup in every pm2 instance!)
  @TrackNewRelicTransaction()
  public async performOneTimeOperations(): Promise<void> {
    if (appEnv.general.ENV === EnvType.Development) {
      // in dev we always want to execute it.. since we dont have pm2
      await this.execOneTimeOperations();
    } else {
      // Production/Staging with PM2
      if (process.env.pm_id === this.pm2Helper.pickLastCPUInstance()) {
        await this.execOneTimeOperations();
      }
    }
  }

  @TrackNewRelicTransaction()
  public async performMultipleInstancesOperations(): Promise<void> {
    cache.clear();

    this.discordBot.initialize();

    await this.shutdownHandling();

    await this.clearSomeQueues();

    this.errorHandlingTracker.overrideDebugHandling();

    if (appEnv.general.ENV === EnvType.Production) {
      this.errorHandlingTracker.overrideErrorHandling();

      this.addUnhandledRejectionListener();
    }
  }

  public shutdownHandling(): void {
    const execQueueShutdown = async (): Promise<void> => {
      await this.redisPubSub.unsubscribe();

      // await this.redisStreams.shutdown();

      // await this.rabbitMQ.close();
    };

    process.on("SIGTERM", async () => {
      await execQueueShutdown();
      await this.messagingBroker.close();

      process.exit(0);
    });

    process.on("SIGINT", async () => {
      await execQueueShutdown();

      await this.messagingBroker.close();
      process.exit(0);
    });
  }

  private async execOneTimeOperations(): Promise<void> {
    await this.socketSessionControl.clearAllSessions();

    await this.cooldown.clearAll();

    await this.resultsPoller.clearAll();

    // Firebase-admin setup, that push notification requires.
    PushNotificationHelper.initialize();

    // this.heapMonitor.monitor();

    await this.seeder.start();

    await this.locker.clear();
  }

  private addUnhandledRejectionListener(): void {
    process.on("uncaughtException", (err) => {
      console.error("❌ Uncaught Exception:", err);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    });
  }

  private async clearSomeQueues(): Promise<void> {
    await this.queueActivityMonitor.clearAllQueues();

    console.log("🧹 BullMQ queues cleared!");
  }
}
