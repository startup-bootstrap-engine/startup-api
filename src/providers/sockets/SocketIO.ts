/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { appEnv } from "@providers/config/env";
import { SOCKET_IO_CONFIG } from "@providers/constants/SocketsConstants";
import { SocketIOAuthMiddleware } from "@providers/middlewares/SocketIOAuthMiddleware";
import { ISocket } from "@rpg-engine/shared";
import { createAdapter } from "@socket.io/redis-adapter";
import { provide } from "inversify-binding-decorators";
import { RedisClientOptions, createClient } from "redis";
import { Socket, Server as SocketIOServer } from "socket.io";

@provide(SocketIO)
export class SocketIO implements ISocket {
  constructor() {}

  private socket: SocketIOServer;
  public channel: Socket;

  public async init(): Promise<void> {
    this.socket = new SocketIOServer(SOCKET_IO_CONFIG);

    // switch (appEnv.general.ENV) {
    //   case EnvType.Development:
    //     this.socket.use(SocketIOAuthMiddleware);
    //     this.socket.listen(appEnv.socket.port.SOCKET);
    //     console.log(`🔌 TCP socket initialized on ${appEnv.socket.port.SOCKET}`);
    //     break;
    //   case EnvType.Production:
    const redisOptions: RedisClientOptions = {
      socket: {
        host: appEnv.database.REDIS_CONTAINER,
        port: appEnv.database.REDIS_PORT,
        connectTimeout: 80000, // (higher latency tolerance)
        // keep connection alive for a mmorpg
        keepAlive: 10000,
        noDelay: true,
        reconnectStrategy: (retries) => Math.min(100 * 2 ** retries, 80000), // Increased backoff strategy
      },
    };

    const pubClient = createClient(redisOptions);
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    // Enable sticky-session
    this.socket.adapter(
      createAdapter(pubClient, subClient, {
        requestsTimeout: 5000,
      })
    );

    this.socket.use(SocketIOAuthMiddleware);
    this.socket.listen(appEnv.socket.port.SOCKET);
    //     break;
    // }
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
