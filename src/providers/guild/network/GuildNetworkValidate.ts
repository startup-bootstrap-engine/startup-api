import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { GuildSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GuildCreate } from "../GuildCreate";

@provide(GuildNetworkValidate)
export class GuildNetworkValidate {
  constructor(private socketAuth: SocketAuth, private guildCreate: GuildCreate) {}

  public onValidateGuild(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(channel, GuildSocketEvents.CreateGuildValidate, async (data, character) => {
      await this.guildCreate.validateGuild(character);
    });
  }
}
