import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { GuildSocketEvents, IGuildInfo, IUIShowMessage, UISocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GuildGet } from "./GuildGet";

@provide(GuildDelete)
export class GuildDelete {
  constructor(private socketMessaging: SocketMessaging, private guildGet: GuildGet) {}

  public async deleteGuild(guildId: string, character: ICharacter): Promise<void> {
    try {
      const guild = await Guild.findById(guildId);
      if (!guild) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, guild not found.");
        return;
      }
      if (guild.guildLeader?.toString() !== character.id.toString()) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you are not the leader of this guild.");
        return;
      }
      const guildSkills = await GuildSkills.findOne({ owner: guildId });
      if (guildSkills) {
        await GuildSkills.deleteOne({ _id: guildSkills.id });
      }
      await Guild.deleteOne({ _id: guildId });
      await this.sendMessageToAllMembers("The guild has been deleted by the leader.", guild);
    } catch (error) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "An error occurred while deleting the guild.");
      console.error(`Error deleting guild with ID ${guildId}:`, error);
    }
  }

  private async sendMessageToAllMembers(message: string, guild: IGuild): Promise<void> {
    const charactersIds = new Set<string>();

    for (const member of guild.members) {
      charactersIds.add(member);
    }

    for (const characterId of charactersIds) {
      try {
        const character = (await Character.findById(characterId).lean().select("channelId")) as ICharacter;

        this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
          message,
          type: "info",
        });

        this.socketMessaging.sendEventToUser<IGuildInfo | null>(
          character.channelId!,
          GuildSocketEvents.GuildInfoOpen,
          null
        );
      } catch (error) {
        console.error(`Error sending message to character with ID ${characterId}:`, error);
      }
    }
  }
}
