import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { GuildSocketEvents, IGuildDelete } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GuildDelete } from "../GuildDelete";

@provide(GuildNetworkDelete)
export class GuildNetworkDelete {
  constructor(private socketAuth: SocketAuth, private guildDelete: GuildDelete) {}

  public onDeleteGuild(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(channel, GuildSocketEvents.GuildDelete, async (data: IGuildDelete, character) => {
      await this.guildDelete.deleteGuild(data.id, character);
    });
  }
}
