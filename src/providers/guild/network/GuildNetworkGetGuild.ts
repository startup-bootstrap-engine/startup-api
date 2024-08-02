import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { GuildSocketEvents, IGuildInfoRead } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GuildGet } from "../GuildGet";

@provide(GuildNetworkGetGuild)
export class GuildNetworkGetGuild {
  constructor(private socketAuth: SocketAuth, private guildGet: GuildGet) {}

  public onGetGuild(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      GuildSocketEvents.GuildInfoRead,
      async (data: IGuildInfoRead, character) => {
        try {
          await this.guildGet.getGuilds(data.guildId, character, data.characterId);
        } catch (error) {
          console.error(error);
        }
      }
    );
  }
}
