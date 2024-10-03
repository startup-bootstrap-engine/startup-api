import { appEnv } from "@providers/config/env";
import { socketEventsBinderControl } from "@providers/inversify/container";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { ISocket, SocketTypes } from "@startup-engine/shared";
import { GeckosIO } from "./GeckosIO";
import { SocketIO } from "./SocketIO";
import { SocketSessionControl } from "./SocketSessionControl";
import { SocketClasses } from "./SocketsTypes";

import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";

@provideSingleton(SocketAdapter)
export class SocketAdapter implements ISocket {
  public static socketClass: SocketClasses; // Setting this method as static is necessary, otherwise it will be undefined after every injection (state does not persist!);

  constructor(
    private socketIO: SocketIO,
    private geckosIO: GeckosIO,
    private socketSessionControl: SocketSessionControl,
    private userRepository: UserRepository
  ) {}

  public async init(socketType: SocketTypes): Promise<void> {
    if (!appEnv.modules.websocket || !appEnv.modules.redis) {
      throw new Error(
        "⚠️ Redis or Websocket modules are not enabled. Please set MODULE_REDIS=true and MODULE_WEBSOCKET=true in your .env and run yarn module:build"
      );
    }

    switch (socketType as SocketTypes) {
      case SocketTypes.UDP:
        console.log("🔌 Initializing UDP socket...");
        await this.geckosIO.init();
        SocketAdapter.socketClass = this.geckosIO;
        break;
      case SocketTypes.TCP:
      default:
        console.log("🔌 Initializing TCP socket...");
        await this.socketIO.init();
        SocketAdapter.socketClass = this.socketIO;
        break;
    }

    this.onConnect();
  }

  public emitToUser<T>(channel: string, eventName: string, data?: T): void {
    try {
      if (appEnv.general.DEBUG_MODE && !appEnv.general.IS_UNIT_TEST) {
        console.info("⬆️ (SENDING): ", channel, eventName, JSON.stringify(data));
      }

      if (data) {
        //! This workaround is to avoid mongoose bjson object issue instead of string ids: https://stackoverflow.com/questions/69532987/mongoose-returns-new-objectid-in-id-field-of-the-result
        data = this.dataIdToString(data);
      }

      SocketAdapter.socketClass?.emitToUser(channel, eventName, data);
    } catch (error) {
      console.error(error);
    }
  }

  public emitToAllUsers<T>(eventName: string, eventData?: T): void {
    if (eventData) {
      eventData = this.dataIdToString(eventData || {}) as T;
    }

    SocketAdapter.socketClass?.emitToAllUsers(eventName, eventData);
  }

  public onConnect(): void {
    SocketAdapter.socketClass?.onConnect(async (channel) => {
      const socketQuery = channel?.handshake?.query;

      // grap userId from socketQuery and update User with channelId

      const { userId } = socketQuery;

      await this.userRepository.updateById(userId, { channelId: channel.id });

      const hasUserId = socketQuery.userId !== "undefined" && socketQuery.userId !== undefined;
      if (hasUserId) {
        const userId = socketQuery.userId as string;
        const hasSocketOngoingSession = await this.socketSessionControl.hasSession(userId);
        if (hasSocketOngoingSession) {
          // force disconnect the previous socket connection
          // const previousUser = await User.findById(userId).lean().select("channelId");

          const previousUser = await this.userRepository.findById(userId, { select: "channelId" });

          if (!previousUser) {
            throw new Error("User not found!");
          }
          void this.emitToUser(previousUser.channelId!, "UserForceDisconnect", {
            reason: "You have been disconnected because you logged in from another device!",
          });
          const previousChannel = this.getChannelById(previousUser.channelId!);
          if (previousChannel) {
            await previousChannel.leave();
            previousChannel.removeAllListeners();
            await socketEventsBinderControl.unbindEvents(previousChannel);
          }
        }
      }
      await socketEventsBinderControl.bindEvents(channel);
    });
  }

  public getChannelById(channelId: string): any {
    return SocketAdapter.socketClass?.getChannelById(channelId);
  }

  public async disconnect(): Promise<void> {
    await SocketAdapter.socketClass?.disconnect();
  }

  private dataIdToString<T>(data): T {
    return JSON.parse(JSON.stringify(data));
  }
}
