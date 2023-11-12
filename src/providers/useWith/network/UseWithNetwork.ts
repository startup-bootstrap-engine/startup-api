import { SocketChannel } from "@providers/sockets/SocketsTypes";

import { provide } from "inversify-binding-decorators";
import { UseWithEntity } from "../abstractions/UseWithEntity";
import { UseWithTile } from "../abstractions/UseWithTile";

@provide(UseWithNetwork)
export class UseWithNetwork {
  constructor(private useWithTile: UseWithTile, private useWithEntity: UseWithEntity) {}

  public onAddEventListeners(channel: SocketChannel): void {
    this.useWithTile.onUseWithTile(channel);
    this.useWithEntity.onUseWithEntity(channel);
  }
}
