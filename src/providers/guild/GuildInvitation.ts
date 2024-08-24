/* eslint-disable mongoose-lean/require-lean */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { GuildSocketEvents, IUIShowMessage, UISocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { GuildCommon } from "./GuildCommon";
import { GuildLevelBonus } from "./GuildLevelBonus";

@provide(GuildInvitation)
export class GuildInvitation {
  constructor(
    private socketMessaging: SocketMessaging,
    private guildCommon: GuildCommon,
    private guildLevelBonus: GuildLevelBonus
  ) {}

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

      const guildSkills = await GuildSkills.findOne({ owner: guild._id }).lean();
      if (!guildSkills) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, guild skills not found.");
        return;
      }

      const maxMembers = this.maxGuildMembers(guildSkills.level);
      const currentMembers = guild.members.length;

      if (currentMembers >= maxMembers) {
        const nextUpgradeLevel = this.nextUpgradeLevel(guildSkills.level, currentMembers);
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          `Sorry, guild is full. Please upgrade your guild level to ${nextUpgradeLevel} to get more members.`
        );
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

    try {
      const guildSkills = await GuildSkills.findOne({ owner: guild._id }).lean();
      if (guildSkills) {
        await this.guildLevelBonus.applyCharacterBuff(character, guildSkills.level);
      }
    } catch (error) {
      console.error("Failed to apply character buff:", error);
    }
  }

  private maxGuildMembers(guildLevel: number): number {
    // Validate the input to ensure guildLevel is at least 1
    if (guildLevel < 1) {
      throw new Error("Guild level must be at least 1");
    }

    if (guildLevel <= 10) {
      return 10;
    } else if (guildLevel <= 20) {
      return 20;
    } else if (guildLevel <= 30) {
      return 30;
    } else if (guildLevel <= 40) {
      return 40;
    } else if (guildLevel <= 50) {
      return 50;
    } else if (guildLevel <= 100) {
      return 100;
    }

    // Handle levels beyond the specified ranges
    return Math.floor(guildLevel / 10) * 10;
  }

  private nextUpgradeLevel(currentLevel: number, currentMembers: number): number {
    // Validate the input to ensure currentLevel and currentMembers are valid
    if (currentLevel < 1) {
      throw new Error("Current level must be at least 1");
    }
    if (currentMembers < 0) {
      throw new Error("Current members must be a non-negative number");
    }

    // Calculate the current range and maximum members for that range
    const maxMembersInCurrentLevel = this.maxGuildMembers(currentLevel);

    // If current members are already at or exceed the maximum for the current level, determine the next upgrade level
    if (currentMembers >= maxMembersInCurrentLevel) {
      return currentLevel + 1;
    }

    // If the current members do not require an upgrade, return the current level
    return currentLevel;
  }
}
