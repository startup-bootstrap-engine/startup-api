import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills, IGuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { GUILD_SKILL_GAIN_DIFFICULTY } from "@providers/constants/GuildConstants";
import { SkillCalculator } from "@providers/skill/SkillCalculator";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";
import { GuildCommon } from "./GuildCommon";
import { GuildLevelBonus } from "./GuildLevelBonus";
import { GuildLevelBonusXP } from "./GuildLevelBonusXP";

@provide(GuildSkillsIncrease)
export class GuildSkillsIncrease {
  constructor(
    private socketMessaging: SocketMessaging,
    private skillCalculator: SkillCalculator,
    private guildCommon: GuildCommon,
    private guildLevelBonusXP: GuildLevelBonusXP,
    private guildLevelBonus: GuildLevelBonus
  ) {}

  public async getGuildSkills(character: ICharacter): Promise<IGuildSkills | null> {
    try {
      const guild = await Guild.findOne({
        $or: [{ guildLeader: character._id }, { members: { $in: [character._id] } }],
      }).lean<IGuildSkills>({ virtuals: true, defaults: true });

      if (!guild) {
        return null;
      }

      const guildSkills = await GuildSkills.findOne({ owner: guild._id }).lean<IGuildSkills>({
        virtuals: true,
        defaults: true,
      });

      return guildSkills || null;
    } catch (error) {
      console.error("Error fetching guild skills:", error);
      return null;
    }
  }

  public async increaseGuildSkills(guildSkills: IGuildSkills, skillPoints: number): Promise<void> {
    try {
      await clearCacheForKey(`${guildSkills.owner}-guild-skills`);

      const { levelUp, newLevel, updatedGuildPoints, newGuildPointsToNextLevel, newUpgradeTokens } =
        this.calculateGuildSkillLevelUp(guildSkills, skillPoints);

      await this.updateGuildSkills(
        guildSkills._id,
        updatedGuildPoints,
        newLevel,
        newGuildPointsToNextLevel,
        newUpgradeTokens
      );

      if (levelUp) {
        const guild = await Guild.findOne({ _id: guildSkills.owner }).lean();
        if (!guild) {
          return;
        }
        await this.guildCommon.notifyGuildMembers(guild.members, newLevel);

        await Promise.all(
          guild.members.map(async (member) => {
            try {
              const character = await Character.findById(member).lean();
              if (character) {
                await this.guildLevelBonusXP.applyXPBonusForGuildLevel(character as ICharacter, newLevel);
                await this.guildLevelBonus.applyCharacterBuff(character as ICharacter, newLevel);
              }
            } catch (error) {
              console.error(`Failed to process member ${member}:`, error);
            }
          })
        );
      }
    } catch (error) {
      console.error("Error increasing guild skills:", error);
    }
  }

  private calculateGuildSkillLevelUp(
    guildSkills: IGuildSkills,
    skillPoints: number
  ): {
    levelUp: boolean;
    newLevel: number;
    updatedGuildPoints: number;
    newGuildPointsToNextLevel: number;
    newUpgradeTokens: number;
  } {
    let levelUp = false;
    let newLevel = guildSkills.level;
    let newGuildPointsToNextLevel = guildSkills.guildPointsToNextLevel;
    const updatedGuildPoints = skillPoints;
    let newUpgradeTokens = guildSkills.upgradeTokens;

    if (updatedGuildPoints >= guildSkills.guildPointsToNextLevel) {
      newLevel++;
      newGuildPointsToNextLevel =
        this.skillCalculator.calculateSPToNextLevel(0, newLevel + 1) * GUILD_SKILL_GAIN_DIFFICULTY;
      levelUp = true;
      newUpgradeTokens++;
    }

    return { levelUp, newLevel, updatedGuildPoints, newGuildPointsToNextLevel, newUpgradeTokens };
  }

  private async updateGuildSkills(
    guildSkillsId: string,
    guildPoints: number,
    level: number,
    guildPointsToNextLevel: number,
    upgradeTokens: number
  ): Promise<void> {
    await GuildSkills.updateOne(
      { _id: guildSkillsId },
      {
        $set: {
          guildPoints,
          level,
          guildPointsToNextLevel,
          upgradeTokens,
        },
      }
    );
  }
}
