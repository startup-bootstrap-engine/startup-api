import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { provide } from "inversify-binding-decorators";
import { GuildNetworkCreate } from "./GuildNetworkCreate";
import { GuildNetworkGetGuild } from "./GuildNetworkGetGuild";
import { GuildNetworkValidate } from "./GuildNetworkValidate";

@provide(GuildNetwork)
export class GuildNetwork {
  constructor(
    private guildNetworkValidate: GuildNetworkValidate,
    private guildNetworkGetGuild: GuildNetworkGetGuild,
    private guildNetworkCreate: GuildNetworkCreate
  ) {}

  public onAddEventListeners(channel: SocketChannel): void {
    this.guildNetworkValidate.onValidateGuild(channel);
    this.guildNetworkGetGuild.onGetGuild(channel);
    this.guildNetworkCreate.onCreateGuild(channel);
  }
}
