import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { GuildSocketEvents, IGuildInfo, IGuildMember, IGuildSkillsInfo } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(GuildGet)
export class GuildGet {
  constructor(private socketMessaging: SocketMessaging) {}

  public async getGuilds(guildId: string | undefined, character: ICharacter): Promise<any> {
    try {
      // check if guildId exists and return guild
      if (guildId) {
        const guild = (await Guild.findOne({ _id: guildId })) as IGuild;
        const guildInfo = await this.convertTOIGuildInfo(guild);
        this.sendGuild(guildInfo, character);
        return;
      }

      const newGuild = await this.getCharactersGuild(character);
      if (newGuild) {
        const guildInfo = await this.convertTOIGuildInfo(newGuild);
        this.sendGuild(guildInfo, character);
      } else {
        this.sendGuild(null, character);
      }
    } catch (error) {
      console.error("Error fetching guild:", error);
      this.sendGuild(null, character);
    }
  }

  private sendGuild(guild: IGuildInfo | null, character: ICharacter): void {
    this.socketMessaging.sendEventToUser<IGuildInfo | null>(
      character.channelId!,
      GuildSocketEvents.GuildInfoOpen,
      guild
    );
  }

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
    const guidLevel = 1;
    try {
      const guildSkills = await GuildSkills.findOne({ owner: guild._id });

      if (!guildSkills) {
        throw new Error("Guild skills not found");
      }
      guidLevel === guildSkills.level;

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

  private mapMemberToGuildMember(member: ICharacter): IGuildMember {
    return {
      _id: member._id.toString(),
      name: member.name,
      class: member.class,
    };
  }
}
