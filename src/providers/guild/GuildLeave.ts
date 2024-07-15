import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { provide } from "inversify-binding-decorators";
import { GuildCommon } from "./GuildCommon";

@provide(GuildLeave)
export class GuildLeave {
  constructor(private socketMessaging: SocketMessaging, private guildCommon: GuildCommon) {}
  public async leaveGuild(guildId: string, memberId: string, character: ICharacter): Promise<void> {
    try {
      const member = (await Character.findById(memberId).lean()) as ICharacter;

      if (!member) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, member not found.");
        return;
      }

      const guild = await this.guildCommon.getCharactersGuild(member);
      if (!guild) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, member is not in a guild.");
        return;
      }

      if (guildId !== guild._id.toString()) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, member is not in this guild.");
        return;
      }

      if (memberId !== character.id.toString() && guild.guildLeader?.toString() !== character.id.toString()) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you are not the leader of this guild.");
        return;
      }

      await Guild.updateOne({ _id: guildId }, { $pull: { members: memberId } });
      const updatedGuild = (await Guild.findById(guildId).lean()) as IGuild;

      if (!updatedGuild) {
        throw new Error("Failed to update guild");
      }

      await this.guildCommon.sendMessageToAllMembers(`${member.name} has left the guild.`, updatedGuild, false, [
        ...updatedGuild.members,
        memberId,
      ]);
    } catch (error) {
      console.error(error);
    }
  }
}
