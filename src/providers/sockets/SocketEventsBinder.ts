import { provide } from "inversify-binding-decorators";
import { SocketChannel } from "./SocketsTypes";

@provide(SocketEventsBinder)
export class SocketEventsBinder {
  constructor() {}

  public bindEvents(channel: SocketChannel): void {}
}
