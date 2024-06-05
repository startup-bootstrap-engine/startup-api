import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { GuildSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(GuildGet)
export class GuildGet {
  constructor(private socketMessaging: SocketMessaging) {}

  public async getGuilds(guildId: string | undefined, character: ICharacter): Promise<any> {
    try {
      // check if guildId exists and return guild
      if (guildId) {
        const guild = (await Guild.findOne({ _id: guildId })) as IGuild;
        this.sendGuild(guild, character);
        return;
      }

      const newGuild = await this.getCharactersGuild(character);
      this.sendGuild(newGuild, character);
    } catch (error) {
      console.error("Error fetching guild:", error);
      this.sendGuild(null, character);
    }
  }

  private sendGuild(guild: IGuild | null, character: ICharacter): void {
    this.socketMessaging.sendEventToUser<IGuild | null>(character.channelId!, GuildSocketEvents.GuildInfoOpen, guild);
  }

  public async getCharactersGuild(character: ICharacter): Promise<IGuild | null> {
    return await Guild.findOne({
      $or: [{ guildLeader: character._id }, { members: character._id }],
    });
  }
}
