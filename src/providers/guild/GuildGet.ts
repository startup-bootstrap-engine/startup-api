import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { GuildSocketEvents, IGuildInfo } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GuildCommon } from "./GuildCommon";

@provide(GuildGet)
export class GuildGet {
  constructor(private socketMessaging: SocketMessaging, private guildCommon: GuildCommon) {}

  public async getGuilds(guildId: string | undefined, character: ICharacter): Promise<any> {
    try {
      // check if guildId exists and return guild
      if (guildId) {
        const guild = (await Guild.findOne({ _id: guildId })) as IGuild;
        const guildInfo = await this.guildCommon.convertToGuildInfo(guild);
        this.sendGuild(guildInfo, character);
        return;
      }

      const newGuild = await this.guildCommon.getCharactersGuild(character);
      if (newGuild) {
        const guildInfo = await this.guildCommon.convertToGuildInfo(newGuild);
        this.sendGuild(guildInfo, character);
      } else {
        this.sendGuild(null, character);
      }
    } catch (error) {
      console.error("Error fetching guild:", error);
      this.sendGuild(null, character);
    }
  }

  private sendGuild(guild: IGuildInfo | null, character: ICharacter): void {
    this.socketMessaging.sendEventToUser<IGuildInfo | null>(
      character.channelId!,
      GuildSocketEvents.GuildInfoOpen,
      guild
    );
  }
}
