import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills, IGuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { SkillCalculator } from "@providers/skill/SkillCalculator";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { provide } from "inversify-binding-decorators";
import { GuildCommon } from "./GuildCommon";

@provide(GuildSkillsIncrease)
export class GuildSkillsIncrease {
  constructor(
    private socketMessaging: SocketMessaging,
    private skillCalculator: SkillCalculator,
    private guildCommon: GuildCommon
  ) {}

  public async getGuildSkills(character: ICharacter): Promise<IGuildSkills | null> {
    try {
      // find guild
      const guild = await Guild.findOne({
        $or: [{ guildLeader: character._id }, { members: { $in: [character._id] } }],
      });

      if (!guild) {
        return null;
      }

      const guildSkills = await GuildSkills.findOne({ owner: guild._id });
      return guildSkills || null;
    } catch (error) {
      console.error("Error fetching guild skills:", error);
      return null;
    }
  }

  public async increaseGuildSkills(guildSkills: IGuildSkills, skillPoints: number): Promise<void> {
    try {
      const { levelUp, newLevel, updatedGuildPoints, newGuildPointsToNextLevel } = this.calculateGuildSkillLevelUp(
        guildSkills,
        skillPoints
      );

      await this.updateGuildSkills(guildSkills._id, updatedGuildPoints, newLevel, newGuildPointsToNextLevel);

      if (levelUp) {
        const guild = await Guild.findOne({ _id: guildSkills.owner });
        if (!guild) {
          return;
        }
        await this.guildCommon.notifyGuildMembers(guild.members, newLevel);
      }
    } catch (error) {
      console.error("Error increasing guild skills:", error);
    }
  }

  private calculateGuildSkillLevelUp(
    guildSkills: IGuildSkills,
    skillPoints: number
  ): { levelUp: boolean; newLevel: number; updatedGuildPoints: number; newGuildPointsToNextLevel: number } {
    let levelUp = false;
    let newLevel = guildSkills.level;
    let newGuildPointsToNextLevel = guildSkills.guildPointsToNextLevel;
    const updatedGuildPoints = skillPoints;

    if (updatedGuildPoints >= guildSkills.guildPointsToNextLevel) {
      newLevel++;
      newGuildPointsToNextLevel = this.skillCalculator.calculateSPToNextLevel(0, newLevel + 1);
      levelUp = true;
    }

    return { levelUp, newLevel, updatedGuildPoints, newGuildPointsToNextLevel };
  }

  private async updateGuildSkills(
    guildSkillsId: string,
    guildPoints: number,
    level: number,
    guildPointsToNextLevel: number
  ): Promise<void> {
    await GuildSkills.updateOne(
      { _id: guildSkillsId },
      {
        $set: {
          guildPoints,
          level,
          guildPointsToNextLevel,
        },
      }
    );
  }
}
