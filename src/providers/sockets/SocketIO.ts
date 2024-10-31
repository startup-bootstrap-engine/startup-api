/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { appEnv } from "@providers/config/env";
import { SOCKET_IO_CONFIG } from "@providers/constants/SocketsConstants";
import { SocketIOAuthMiddleware } from "@providers/middlewares/SocketIOAuthMiddleware";
import { createAdapter } from "@socket.io/redis-adapter";
import { ISocket } from "@startup-engine/shared";
import { provide } from "inversify-binding-decorators";
import IORedis from "ioredis";
import { Socket, Server as SocketIOServer } from "socket.io";

@provide(SocketIO)
export class SocketIO implements ISocket {
  constructor() {}

  private socket: SocketIOServer;

  public init(): void {
    this.socket = new SocketIOServer(SOCKET_IO_CONFIG);

    const redisOptions = {
      host: appEnv.database.REDIS_CONTAINER,
      port: Number(appEnv.database.REDIS_PORT),
      connectTimeout: 80000, // Higher latency tolerance
      keepAlive: 10000, // Keep connection alive for MMORPG
      retryStrategy: (retries: number) => Math.min(100 * 2 ** retries, 80000), // Exponential backoff
    };

    const pubClient = new IORedis(redisOptions);
    const subClient = pubClient.duplicate();

    pubClient.on("error", (err) => {
      console.error("Redis Pub Client Error:", err);
    });

    pubClient.on("end", () => {
      console.warn("Redis Pub Client Connection Closed. Attempting to reconnect...");
    });

    subClient.on("error", (err) => {
      console.error("Redis Sub Client Error:", err);
    });

    subClient.on("end", () => {
      console.warn("Redis Sub Client Connection Closed. Attempting to reconnect...");
    });

    this.socket.adapter(createAdapter(pubClient, subClient, { requestsTimeout: 5000 }) as any);

    this.socket.use(SocketIOAuthMiddleware);
    this.socket.listen(appEnv.socket.port.SOCKET);
    console.log(`🔌 TCP socket initialized on port ${appEnv.socket.port.SOCKET}`);
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
