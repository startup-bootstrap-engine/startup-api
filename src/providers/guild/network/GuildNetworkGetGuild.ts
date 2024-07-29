import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { GuildSocketEvents, IGuildInfoRead } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GuildGet } from "../GuildGet";

@provide(GuildNetworkGetGuild)
export class GuildNetworkGetGuild {
  constructor(private socketAuth: SocketAuth, private guildGet: GuildGet, private dynamicQueue: DynamicQueue) {}

  public onGetGuild(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      GuildSocketEvents.GuildInfoRead,
      async (data: IGuildInfoRead, character) => {
        try {
          await this.addToQueue(data, character);
        } catch (error) {
          console.error(error);
        }
      }
    );
  }

  public async addToQueue(data: IGuildInfoRead, character: ICharacter): Promise<void> {
    await this.dynamicQueue.addJob(
      "guild-get-info",
      (job) => {
        const { character, data } = job.data;

        void this.guildGet.getGuilds(data.guildId, character, data.characterId);
      },
      {
        character,
        data,
      }
    );
  }
}
