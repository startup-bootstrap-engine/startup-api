import { provide } from "inversify-binding-decorators";
import { SocketChannel } from "./SocketsTypes";
import { SocketExampleNetworkPing } from "./networks/SocketExampleNetworkPing";

@provide(SocketEventsBinder)
export class SocketEventsBinder {
  constructor(private socketExampleNetworkPing: SocketExampleNetworkPing) {}

  public bindEvents(channel: SocketChannel): void {
    this.socketExampleNetworkPing.onPingListener(channel);
  }
}
