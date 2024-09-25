import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { GuildSocketEvents, IGuildInfo } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GuildCommon, IGuildInfoWithOptionalUpgradeTokens } from "./GuildCommon";

@provide(GuildGet)
export class GuildGet {
  constructor(private socketMessaging: SocketMessaging, private guildCommon: GuildCommon) {}

  public async getGuilds(guildId: string | undefined, character: ICharacter, characterId?: string): Promise<void> {
    try {
      if (characterId) {
        await this.handleCharacterGuild(characterId, character);
      } else if (guildId) {
        await this.handleGuild(guildId, character);
      } else {
        await this.handleCharacterGuild(character._id, character);
      }
    } catch (error) {
      console.error("Error fetching guild:", error);
      this.sendGuild(null, character);
    }
  }

  private async handleCharacterGuild(characterId: string, character: ICharacter): Promise<void> {
    const otherCharacter = (await Character.findById(characterId).lean()) as ICharacter | null;
    if (!otherCharacter) {
      this.sendGuild(null, character);
      return;
    }
    const otherGuild = await this.guildCommon.getCharactersGuild(otherCharacter);
    await this.sendGuildInfo(otherGuild, character);
  }

  private async handleGuild(guildId: string, character: ICharacter): Promise<void> {
    const guild = (await Guild.findOne({ _id: guildId }).lean()) as IGuild | null;
    await this.sendGuildInfo(guild, character);
  }

  private async sendGuildInfo(guild: IGuild | null, character: ICharacter): Promise<void> {
    const guildInfo = guild ? await this.guildCommon.convertToGuildInfo(guild) : null;
    this.sendGuild(guildInfo, character);
  }

  private sendGuild(guild: IGuildInfoWithOptionalUpgradeTokens | null, character: ICharacter): void {
    this.socketMessaging.sendEventToUser<IGuildInfoWithOptionalUpgradeTokens | null>(
      character.channelId!,
      GuildSocketEvents.GuildInfoOpen,
      guild
    );
  }
}
