import { SocketChannel } from "@providers/sockets/SocketsTypes";

import { provide } from "inversify-binding-decorators";
import { UseWithEntity } from "../abstractions/UseWithEntity";
import { UseWithItemToItem } from "../abstractions/UseWithItemToItem";
import { UseWithSeed } from "../abstractions/UseWithSeed";
import { UseWithTileQueue } from "../abstractions/UseWithTileQueue";

@provide(UseWithNetwork)
export class UseWithNetwork {
  constructor(
    private useWithTile: UseWithTileQueue,
    private useWithEntity: UseWithEntity,
    private useWithSeed: UseWithSeed,
    private useWithItemToItem: UseWithItemToItem
  ) {}

  public onAddEventListeners(channel: SocketChannel): void {
    this.useWithTile.onUseWithTile(channel);
    this.useWithEntity.onUseWithEntity(channel);
    this.useWithSeed.onUseWithSeed(channel);
    this.useWithItemToItem.onUseWithItemToItem(channel);
  }
}
