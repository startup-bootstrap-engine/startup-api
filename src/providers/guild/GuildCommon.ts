/* eslint-disable mongoose-lean/require-lean */
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

  public async hasGuild(character: ICharacter): Promise<boolean> {
    return await Guild.exists({
      $or: [{ guildLeader: character._id }, { members: character._id }],
    });
  }

  public async convertToGuildInfo(guild: IGuild): Promise<IGuildInfo> {
    const memberDetails = await this.createMemberDetails(guild.members);

    const guildSkillsInfo: IGuildSkillsInfo[] = [];
    let guildLevel = 1;

    try {
      const guildSkills = await GuildSkills.findOne({ owner: guild._id }).lean({
        virtuals: true,
        defaults: true,
      });
      if (!guildSkills) {
        throw new Error("Guild skills not found");
      }

      guildLevel = guildSkills.level;

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

    return {
      _id: guild._id.toString(),
      name: guild.name,
      tag: guild.tag,
      coatOfArms: guild.coatOfArms,
      guildLeader: guild.guildLeader?.toString() ?? "",
      members: memberDetails,
      territoriesOwned: guild.territoriesOwned,
      guildSkills: guildSkillsInfo,
      guidLevel: guildLevel,
    };
  }

  public async createMemberDetails(memberIds: string[]): Promise<IGuildMember[]> {
    const memberDetails = await Promise.all(
      memberIds.map(async (memberId) => {
        const member = (await Character.findById(memberId).lean()) as ICharacter;
        if (!member) {
          console.warn(`Member not found for ID: ${memberId}`);
          return null;
        }
        return this.mapMemberToGuildMember(member);
      })
    );

    return memberDetails.filter((member): member is IGuildMember => member !== null);
  }

  public async sendMessageToAllMembers(
    message: string,
    guild: IGuild,
    isDelete?: boolean,
    members?: string[]
  ): Promise<void> {
    members = members || guild.members;

    const onlineCharacters = (await Character.find({ isOnline: true }).lean()) as ICharacter[];

    for (const character of onlineCharacters) {
      try {
        if (!character || !character.channelId) continue;

        this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId, UISocketEvents.ShowMessage, {
          message,
          type: "info",
        });

        if (isDelete) {
          const deletePayload = await this.createMemberDetails(members);

          this.socketMessaging.sendEventToUser(character.channelId, GuildSocketEvents.GuildInfoDelete, deletePayload);
        } else {
          const payload = await this.convertToGuildInfo(guild);
          this.sendGuildEvent(character.channelId, GuildSocketEvents.GuildInfoOpen, payload);
        }
      } catch (error) {
        console.error(`Error sending message to character with ID ${character._id}:`, error);
      }
    }
  }

  private sendGuildEvent<T>(channelId: string, event: GuildSocketEvents, payload: T): void {
    this.socketMessaging.sendEventToUser<T>(channelId, event, payload);
  }

  public async notifyGuildMembers(members: string[], newLevel: number): Promise<void> {
    try {
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
    } catch (error) {
      console.error("Error notifying guild members:", error);
      throw error;
    }
  }

  private mapMemberToGuildMember(member: ICharacter): IGuildMember {
    return {
      _id: member._id.toString(),
      name: member.name,
      class: member.class,
    };
  }
}
