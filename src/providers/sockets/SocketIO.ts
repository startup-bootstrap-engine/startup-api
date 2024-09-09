/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { NewRelic } from "@providers/analytics/NewRelic";
import { appEnv } from "@providers/config/env";
import { SOCKET_IO_CONFIG } from "@providers/constants/SocketsConstants";
import { SocketIOAuthMiddleware } from "@providers/middlewares/SocketIOAuthMiddleware";
import { EnvType, ISocket } from "@rpg-engine/shared";
import { createAdapter } from "@socket.io/redis-adapter";
import { provide } from "inversify-binding-decorators";
import { createClient, RedisClientOptions } from "redis";
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
        console.log(`🔌 TCP socket initialized on ${appEnv.socket.port.SOCKET}`);
        break;
      case EnvType.Production:
        const redisOptions: RedisClientOptions = {
          socket: {
            host: appEnv.database.REDIS_CONTAINER,
            port: appEnv.database.REDIS_PORT,
            connectTimeout: 20000,
            // keep connection alive for a mmorpg
            keepAlive: 5000,
            noDelay: true,
            reconnectStrategy: (retries) => Math.min(100 * 2 ** retries, 20000),
          },
          pingInterval: 5000, // 5 seconds
        };

        const pubClient = createClient(redisOptions) as any;
        const subClient = pubClient.duplicate() as any;

        pubClient.on("error", (err) => {
          console.error("Redis Pub Client Error:", err);
          this.newRelic.noticeError(err);
        });

        subClient.on("error", (err) => {
          console.error("Redis Sub Client Error:", err);
          this.newRelic.noticeError(err);
        });

        pubClient.on("connect", () => console.log("Redis Pub Client Connected"));
        subClient.on("connect", () => console.log("Redis Sub Client Connected"));

        const connectRedis = async (): Promise<void> => {
          try {
            await pubClient.connect();
            await subClient.connect();
            this.socket.adapter(createAdapter(pubClient, subClient));
            console.log("Redis adapter set for Socket.IO");
          } catch (error) {
            console.error("Redis connection error:", error);
            this.newRelic.noticeError(error);
            setTimeout(connectRedis, 5000); // Retry connection after 5 seconds
          }
        };

        await connectRedis();
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
