import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills, IGuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { SkillCalculator } from "@providers/skill/SkillCalculator";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IUIShowMessage, UISocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(GuildSkillsIncrease)
export class GuildSkillsIncrease {
  constructor(private socketMessaging: SocketMessaging, private skillCalculator: SkillCalculator) {}

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
        await this.notifyGuildMembers(guildSkills.owner as string, newLevel);
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

  private async notifyGuildMembers(guildId: string, newLevel: number): Promise<void> {
    const guild = await Guild.findOne({ _id: guildId });
    if (!guild) {
      return;
    }

    const characters = await Character.find({ _id: { $in: guild.members } })
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
}
