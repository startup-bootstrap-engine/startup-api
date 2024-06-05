import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { GuildSocketEvents, IGuildForm } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GuildCreate } from "../GuildCreate";

@provide(GuildNetworkCreate)
export class GuildNetworkCreate {
  constructor(private socketAuth: SocketAuth, private guildCreate: GuildCreate) {}

  public onCreateGuild(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(channel, GuildSocketEvents.CreateGuild, async (data: IGuildForm, character) => {
      await this.guildCreate.createGuild(data, character);
    });
  }
}
