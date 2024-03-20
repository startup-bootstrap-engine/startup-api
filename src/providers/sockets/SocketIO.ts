/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { NewRelic } from "@providers/analytics/NewRelic";
import { appEnv } from "@providers/config/env";
import { SOCKET_IO_CONFIG } from "@providers/constants/SocketsConstants";
import { SocketIOAuthMiddleware } from "@providers/middlewares/SocketIOAuthMiddleware";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { EnvType, ISocket } from "@rpg-engine/shared";
import { createAdapter } from "@socket.io/redis-adapter";
import { provide } from "inversify-binding-decorators";
import { RedisClientOptions, createClient } from "redis";
import { Socket, Server as SocketIOServer } from "socket.io";

@provide(SocketIO)
export class SocketIO implements ISocket {
  constructor(private newRelic: NewRelic) {}

  private socket: SocketIOServer;
  public channel: Socket;

  public async init(): Promise<void> {
    this.socket = new SocketIOServer(SOCKET_IO_CONFIG);

    switch (appEnv.general.ENV) {
      case EnvType.Development:
        this.socket.use(SocketIOAuthMiddleware);
        this.socket.listen(appEnv.socket.port.SOCKET);
        break;
      case EnvType.Production:
        const redisOptions: RedisClientOptions = {
          socket: {
            host: appEnv.database.REDIS_CONTAINER,
            port: appEnv.database.REDIS_PORT,
            connectTimeout: 10000,
            // keep connection alive for a mmorpg
            keepAlive: 1000,
            noDelay: true,
            reconnectStrategy: (retries) => Math.min(50 * 2 ** retries, 30000), // Exponential backoff
          },
          pingInterval: 2000,
        };

        const pubClient = createClient(redisOptions);
        const subClient = pubClient.duplicate();

        const handleRedisError = (client: string) => (error: Error) => {
          console.error(`${client} Redis error:`, error);
        };

        pubClient.on("error", handleRedisError("Publisher"));
        subClient.on("error", handleRedisError("Subscriber"));

        try {
          await Promise.all([pubClient.connect(), subClient.connect()]);
          this.socket.adapter(createAdapter(pubClient, subClient));
          this.socket.use(SocketIOAuthMiddleware);
          this.socket.listen(appEnv.socket.port.SOCKET);
        } catch (error) {
          console.error("Failed to initialize Redis clients:", error);
          this.newRelic.noticeError(error);
        }
        break;
    }
  }

  public emitToUser<T>(channel: string, eventName: string, data?: T): void {
    this.socket.to(channel).emit(eventName, data || {});
  }

  public emitToAllUsers<T>(eventName: string, data?: T): void {
    this.socket.emit(eventName, data || {});
  }

  public onConnect(onConnectFn: (channel) => void): void {
    this.socket.on("connection", (channel) => {
      onConnectFn(channel);

      channel.on("disconnect", (reason: string) => {
        console.log(`Client disconnected: ${channel.id}, Reason: ${reason}`);

        // Log the disconnection reason with NewRelic or any other monitoring tool you're using
        this.newRelic.trackMetric(
          NewRelicMetricCategory.Count,
          NewRelicSubCategory.Server,
          `SocketIODisconnect/${reason}`,
          1
        );
      });
    });
  }

  public async disconnect(): Promise<void> {
    console.log("🔌 Shutting down TCP socket connections...");
    await this.socket.close();
  }

  public getChannelById(channelId: string): Socket | undefined {
    return this.socket.sockets.sockets.get(channelId);
  }
}
