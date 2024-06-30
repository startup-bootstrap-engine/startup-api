import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  GuildSocketEvents,
  IGuildInfo,
  IGuildMember,
  IGuildSkillsInfo,
  IUIShowMessage,
  UISocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(GuildCommon)
export class GuildCommon {
  constructor(private socketMessaging: SocketMessaging) {}

  public async getCharactersGuild(character: ICharacter): Promise<IGuild | null> {
    return await Guild.findOne({
      $or: [{ guildLeader: character._id }, { members: character._id }],
    });
  }

  public async convertTOIGuildInfo(guild: IGuild): Promise<IGuildInfo> {
    const memberDetails = await Promise.all(
      guild.members.map(async (memberId) => {
        const member = await Character.findById(memberId);
        if (!member) {
          console.warn(`Member not found for ID: ${memberId}`);
          return null;
        }
        return this.mapMemberToGuildMember(member);
      })
    ).then((results) => results.filter((member) => member !== null));
    const guildSkillsInfo = [] as IGuildSkillsInfo[];
    let guidLevel = 1;
    try {
      const guildSkills = await GuildSkills.findOne({ owner: guild._id });

      if (!guildSkills) {
        throw new Error("Guild skills not found");
      }
      guidLevel = guildSkills.level;

      const skills = ["fireSkill", "waterSkill", "earthSkill", "airSkill", "corruptionSkill", "natureSkill"];

      for (const skill of skills) {
        const skillDetails = guildSkills[skill];
        guildSkillsInfo.push({
          name: skillDetails.type,
          level: skillDetails.level,
          xp: skillDetails.skillPoints,
        });
      }
    } catch (error) {
      console.error("Error fetching guild skills:", error);
    }

    const guildInfo: IGuildInfo = {
      _id: guild._id.toString(),
      name: guild.name,
      tag: guild.tag,
      coatOfArms: guild.coatOfArms,
      guildLeader: guild.guildLeader?.toString() ?? "",
      members: memberDetails as IGuildMember[],
      territoriesOwned: guild.territoriesOwned,
      guildSkills: guildSkillsInfo,
      guidLevel: guidLevel,
    };

    return guildInfo;
  }

  public async sendMessageToAllMembers(message: string, guild: IGuild, isDelete?: boolean): Promise<void> {
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
        let playLoad: IGuildInfo | null = null;
        if (!isDelete) {
          playLoad = await this.convertTOIGuildInfo(guild);
        }

        this.socketMessaging.sendEventToUser<IGuildInfo | null>(
          character.channelId!,
          GuildSocketEvents.GuildInfoOpen,
          playLoad
        );
      } catch (error) {
        console.error(`Error sending message to character with ID ${characterId}:`, error);
      }
    }
  }

  public async notifyGuildMembers(members: string[], newLevel: number): Promise<void> {
    const characters = await Character.find({ _id: { $in: members } })
      .lean()
      .select("channelId");
    characters.forEach((character) => {
      if (character.channelId) {
        this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId, UISocketEvents.ShowMessage, {
          message: `Your guild level is now ${newLevel}.`,
          type: "info",
        });
      }
    });
  }

  private mapMemberToGuildMember(member: ICharacter): IGuildMember {
    return {
      _id: member._id.toString(),
      name: member.name,
      class: member.class,
    };
  }
}
