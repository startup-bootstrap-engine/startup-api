import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { provide } from "inversify-binding-decorators";
import { GuildNetworkCreate } from "./GuildNetworkCreate";
import { GuildNetworkDelete } from "./GuildNetworkDelete";
import { GuildNetworkGetGuild } from "./GuildNetworkGetGuild";
import { GuildNetworkInviteToGuild } from "./GuildNetworkInviteToGuild";
import { GuildNetworkLeave } from "./GuildNetworkLeave";
import { GuildNetworkValidate } from "./GuildNetworkValidate";

@provide(GuildNetwork)
export class GuildNetwork {
  constructor(
    private guildNetworkValidate: GuildNetworkValidate,
    private guildNetworkGetGuild: GuildNetworkGetGuild,
    private guildNetworkCreate: GuildNetworkCreate,
    private guildNetworkInviteToGuild: GuildNetworkInviteToGuild,
    private guildNetworkDelete: GuildNetworkDelete,
    private guildNetworkLeave: GuildNetworkLeave
  ) {}

  public onAddEventListeners(channel: SocketChannel): void {
    this.guildNetworkValidate.onValidateGuild(channel);
    this.guildNetworkGetGuild.onGetGuild(channel);
    this.guildNetworkCreate.onCreateGuild(channel);
    this.guildNetworkInviteToGuild.onInviteToGuild(channel);
    this.guildNetworkDelete.onDeleteGuild(channel);
    this.guildNetworkLeave.onLeaveGuild(channel);
  }
}
