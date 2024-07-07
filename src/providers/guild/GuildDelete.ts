import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { provide } from "inversify-binding-decorators";
import { GuildCommon } from "./GuildCommon";

@provide(GuildDelete)
export class GuildDelete {
  constructor(private socketMessaging: SocketMessaging, private guildCommon: GuildCommon) {}

  public async deleteGuild(guildId: string, character: ICharacter): Promise<void> {
    try {
      // eslint-disable-next-line mongoose-lean/require-lean
      const guild = await Guild.findById(guildId);
      if (!guild) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, guild not found.");
        return;
      }
      if (guild.guildLeader?.toString() !== character.id.toString()) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you are not the leader of this guild.");
        return;
      }
      const guildSkills = await GuildSkills.findOne({ owner: guildId }).lean({
        virtuals: true,
        defaults: true,
      });
      if (guildSkills) {
        await GuildSkills.deleteOne({ _id: guildSkills._id });
      }
      await Guild.deleteOne({ _id: guildId });
      await this.guildCommon.sendMessageToAllMembers("The guild has been deleted by the leader.", guild, true);
    } catch (error) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "An error occurred while deleting the guild.");
      console.error(`Error deleting guild with ID ${guildId}:`, error);
    }
  }
}
