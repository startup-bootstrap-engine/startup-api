import { SocketChannel } from "@providers/sockets/SocketsTypes";

import { provide } from "inversify-binding-decorators";
import { UseWithEntity } from "../abstractions/UseWithEntity";
import { UseWithSeed } from "../abstractions/UseWithSeed";
import { UseWithTile } from "../abstractions/UseWithTile";

@provide(UseWithNetwork)
export class UseWithNetwork {
  constructor(
    private useWithTile: UseWithTile,
    private useWithEntity: UseWithEntity,
    private useWithSeed: UseWithSeed
  ) {}

  public onAddEventListeners(channel: SocketChannel): void {
    this.useWithTile.onUseWithTile(channel);
    this.useWithEntity.onUseWithEntity(channel);
    this.useWithSeed.onUseWithSeed(channel);
  }
}
