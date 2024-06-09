import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { GuildSocketEvents, IGuildManagementFromClient } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GuildInvitation } from "../GuildInvitation";

@provide(GuildNetworkInviteToGuild)
export class GuildNetworkInviteToGuild {
  constructor(private socketAuth: SocketAuth, private guildInvitation: GuildInvitation) {}

  public onInviteToGuild(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      GuildSocketEvents.GuildInvite,
      async (data: IGuildManagementFromClient, character) => {
        try {
          await this.guildInvitation.inviteToGuild(character, data.leaderId!, data.targetId!, data.guildId!);
        } catch (error) {
          console.error("Error handling invite to guild", error);
        }
      }
    );

    this.socketAuth.authCharacterOn(
      channel,
      GuildSocketEvents.GuildAcceptInvite,
      async (data: IGuildManagementFromClient, character) => {
        try {
          await this.guildInvitation.acceptInviteGuild(character, data.leaderId, data.targetId, data.guildId);
        } catch (error) {
          console.error("Error handling accept invite to guild", error);
        }
      }
    );
  }
}
