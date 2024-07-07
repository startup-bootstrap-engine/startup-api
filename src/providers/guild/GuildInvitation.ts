/* eslint-disable mongoose-lean/require-lean */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { GuildSocketEvents, IUIShowMessage, UISocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GuildCommon } from "./GuildCommon";

@provide(GuildInvitation)
export class GuildInvitation {
  constructor(private socketMessaging: SocketMessaging, private guildCommon: GuildCommon) {}

  public async inviteToGuild(
    character: ICharacter,
    leaderId?: string,
    targetId?: string,
    guildId?: string
  ): Promise<void> {
    try {
      const guild = (await Guild.findById(guildId).lean()) as IGuild;
      if (!guild) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, guild not found.");
        return;
      }

      if (character.id !== leaderId && guild.guildLeader !== character.id) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, you are not the leader of this guild, only the leader can invite people to the guild."
        );
        return;
      }

      const target = (await Character.findById(targetId).lean()) as ICharacter;
      if (!target) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, target not found.");
        return;
      }

      const targetGuild = await this.guildCommon.getCharactersGuild(target);
      if (targetGuild) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, Your target is already in a guild.");
        return;
      }

      this.socketMessaging.sendEventToUser(target?.channelId!, GuildSocketEvents.GuildInvite, {
        leaderId: character._id,
        leaderName: character.name,
      });

      this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
        message: `Send guild invite to ${target.name}!`,
        type: "info",
      });
    } catch (error) {
      console.error("Error inviting to guild:", error);
    }
  }

  public async acceptInviteGuild(
    character: ICharacter,
    leaderId?: string,
    targetId?: string,
    guildId?: string
  ): Promise<void> {
    if (!targetId) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, character not found.");
      return;
    }

    if (guildId) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, You are already in a guild.");
      return;
    }

    const guild = (await Guild.findOne({ guildLeader: leaderId })) as IGuild;

    if (!guild) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, guild not found.");
      return;
    }

    guild.members.push(targetId);
    await guild.save();

    const message = `${character.name} joined the guild!`;
    await this.guildCommon.sendMessageToAllMembers(message, guild);
  }
}
