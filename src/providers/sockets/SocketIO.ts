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
  private socket: SocketIOServer;
  private pubClient: IORedis;
  private subClient: IORedis;

  constructor() {}

  public init(): void {
    this.socket = new SocketIOServer(SOCKET_IO_CONFIG);

    const redisOptions = {
      host: appEnv.database.REDIS_CONTAINER,
      port: Number(appEnv.database.REDIS_PORT),
      connectTimeout: 30000,
      keepAlive: 15000,
      retryStrategy: (retries: number): number | null => {
        if (retries > 10) {
          console.error("Max Redis retry attempts reached");
          return null;
        }
        return Math.min(1000 * Math.pow(2, retries), 30000);
      },
      reconnectOnError: (err: Error): boolean => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      autoResendUnfulfilledCommands: true,
      lazyConnect: true,
    };

    this.pubClient = new IORedis(redisOptions);
    this.subClient = this.pubClient.duplicate();

    this.setupRedisErrorHandling(this.pubClient, "Pub");
    this.setupRedisErrorHandling(this.subClient, "Sub");

    this.socket.adapter(
      createAdapter(this.pubClient, this.subClient, {
        requestsTimeout: 15000,
        publishOnSpecificResponseChannel: true,
      })
    );

    this.socket.on("connect_error", (error: Error) => {
      console.error("Socket.IO connection error:", error);
    });

    this.socket.on("disconnect", (reason: string) => {
      console.warn("Socket.IO disconnected:", reason);
    });

    this.socket.on("connection", (socket: Socket) => {
      this.monitorSocketConnection(socket);
    });

    this.socket.use(SocketIOAuthMiddleware);
    this.socket.listen(appEnv.socket.port.SOCKET);
    console.log(`🔌 TCP socket initialized on port ${appEnv.socket.port.SOCKET}`);
  }

  private setupRedisErrorHandling(client: IORedis, clientType: string): void {
    client.on("error", (err: Error) => {
      console.error(`Redis ${clientType} Client Error:`, err);
    });

    client.on("end", () => {
      console.warn(`Redis ${clientType} Client Connection Closed. Attempting to reconnect...`);
    });

    client.on("reconnecting", (delay: number) => {
      console.log(`Redis ${clientType} Client reconnecting in ${delay}ms`);
    });

    client.on("ready", () => {
      console.log(`Redis ${clientType} Client Ready`);
    });

    client.on("connect", () => {
      console.log(`Redis ${clientType} Client Connected`);
    });
  }

  private monitorSocketConnection(socket: Socket): void {
    socket.on("disconnect", (reason: string) => {
      console.log(`Socket ${socket.id} disconnected: ${reason}`);
    });

    socket.on("error", (error: Error) => {
      console.error(`Socket ${socket.id} error:`, error);
    });

    socket.conn.on("packet", (packet: { type: string }) => {
      if (packet.type === "ping") {
        console.debug(`Ping received from ${socket.id}`);
      }
    });

    // Monitor connection quality
    const connectionQualityInterval = setInterval(() => {
      if (socket.connected) {
        const transport = socket.conn.transport.name;
        console.debug(`Socket ${socket.id} - Transport: ${transport}`);
      } else {
        clearInterval(connectionQualityInterval);
      }
    }, 30000);

    socket.on("disconnect", () => {
      clearInterval(connectionQualityInterval);
    });
  }

  public emitToUser<T>(channel: string, eventName: string, data?: T): void {
    try {
      this.socket.to(channel).emit(eventName, data || {});
    } catch (error) {
      console.error(`Error emitting to user ${channel}:`, error);
    }
  }

  public emitToAllUsers<T>(eventName: string, data?: T): void {
    try {
      this.socket.emit(eventName, data || {});
    } catch (error) {
      console.error("Error broadcasting to all users:", error);
    }
  }

  public onConnect(onConnectFn: (channel: Socket) => void): void {
    this.socket.on("connection", (channel) => {
      try {
        onConnectFn(channel);
      } catch (error) {
        console.error("Error in connection handler:", error);
      }
    });
  }

  public async disconnect(): Promise<void> {
    console.log("🔌 Shutting down TCP socket connections...");
    try {
      await Promise.all([this.socket.close(), this.pubClient.quit(), this.subClient.quit()]);
    } catch (error) {
      console.error("Error during disconnect:", error);
    }
  }

  public getChannelById(channelId: string): Socket | undefined {
    try {
      return this.socket.sockets.sockets.get(channelId);
    } catch (error) {
      console.error(`Error getting channel ${channelId}:`, error);
      return undefined;
    }
  }
}
