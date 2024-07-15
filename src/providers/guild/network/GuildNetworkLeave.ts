import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { GuildSocketEvents, IGuildLeave } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GuildLeave } from "../GuildLeave";

@provide(GuildNetworkLeave)
export class GuildNetworkLeave {
  constructor(private socketAuth: SocketAuth, private guildLeave: GuildLeave) {}

  public onLeaveGuild(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      GuildSocketEvents.GuildMemberLeave,
      async (data: IGuildLeave, character) => {
        await this.guildLeave.leaveGuild(data.guildId, data.memberId, character);
      }
    );
  }
}
