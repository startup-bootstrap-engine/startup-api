import { appEnv } from "@providers/config/env";
import { socketEventsBinder } from "@providers/inversify/container";
import { ISocket, SocketTypes } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GeckosIO } from "./GeckosIO";
import { SocketIO } from "./SocketIO";
import { SocketSessionControl } from "./SocketSessionControl";
import { SocketClasses } from "./SocketsTypes";

@provide(SocketAdapter)
export class SocketAdapter implements ISocket {
  public static socketClass: SocketClasses; // Setting this method as static is necessary, otherwise it will be undefined after every injection (state does not persist!);

  constructor(
    private socketIO: SocketIO,
    private geckosIO: GeckosIO,
    private socketSessionControl: SocketSessionControl
  ) {}

  public async init(socketType: SocketTypes): Promise<void> {
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
    if (appEnv.general.DEBUG_MODE && !appEnv.general.IS_UNIT_TEST) {
      console.log("⬆️ (SENDING): ", channel, eventName, JSON.stringify(data));
    }

    if (data) {
      //! This workaround is to avoid mongoose bjson object issue instead of string ids: https://stackoverflow.com/questions/69532987/mongoose-returns-new-objectid-in-id-field-of-the-result
      data = this.dataIdToString(data);
    }

    SocketAdapter.socketClass?.emitToUser(channel, eventName, data);
  }

  public emitToAllUsers<T>(eventName: string, eventData?: T): void {
    if (eventData) {
      eventData = this.dataIdToString(eventData || {}) as T;
    }

    SocketAdapter.socketClass?.emitToAllUsers(eventName, eventData);
  }

  public onConnect(): void {
    SocketAdapter.socketClass?.onConnect(async (channel) => {
      const hasSocketSession = await this.socketSessionControl.hasSession(channel.id);

      if (hasSocketSession) {
        return; // avoid binding events multiple times
      }

      socketEventsBinder.bindEvents(channel);
    });
  }

  public async disconnect(): Promise<void> {
    await SocketAdapter.socketClass?.disconnect();
  }

  private dataIdToString<T>(data): T {
    return JSON.parse(JSON.stringify(data));
  }
}
