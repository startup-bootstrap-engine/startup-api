import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { provide } from "inversify-binding-decorators";
import { GuildCommon } from "./GuildCommon";
import { GuildDelete } from "./GuildDelete";
import { GuildLevelBonus } from "./GuildLevelBonus";

@provide(GuildLeave)
export class GuildLeave {
  constructor(
    private socketMessaging: SocketMessaging,
    private guildCommon: GuildCommon,
    private guildLevelBonus: GuildLevelBonus,
    private guildDelete: GuildDelete
  ) {}

  public async leaveGuild(guildId: string, memberId: string, character: ICharacter): Promise<void> {
    try {
      const member = (await Character.findById(memberId).lean({ virtuals: true, defaults: true })) as ICharacter;

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

      // Check if the member to be removed is the guild leader
      if (guild.guildLeader?.toString() === memberId) {
        // If there more than one member, reassign the guild leader
        if (guild.members.length > 1) {
          await Guild.updateOne(
            { _id: guildId },
            { $pull: { members: memberId }, $set: { guildLeader: guild.members[1].toString() } }
          );
        } else {
          // If only one member remains, delete the guild
          await this.guildDelete.deleteGuild(guildId, member);
        }
      } else {
        // If the member is not the guild leader, simply remove them from the guild
        await Guild.updateOne({ _id: guildId }, { $pull: { members: memberId } });
      }

      const updatedGuild = (await Guild.findById(guildId).lean()) as IGuild;
      if (!updatedGuild) {
        throw new Error("Failed to update guild");
      }

      await this.guildCommon.sendMessageToAllMembers(
        `${member.name} has left the ${updatedGuild.name} guild.`,
        updatedGuild,
        true,
        [memberId]
      );
      await this.guildLevelBonus.removeCharacterBuff(member);
    } catch (error) {
      console.error(error);
    }
  }
}
