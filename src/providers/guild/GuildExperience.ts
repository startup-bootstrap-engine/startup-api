import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills, IGuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { SkillCalculator } from "@providers/skill/SkillCalculator";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";

import { GUILD_XP_GAIN_DIFFICULTY } from "@providers/constants/GuildConstants";
import { provide } from "inversify-binding-decorators";
import { GuildCommon } from "./GuildCommon";

@provide(GuildExperience)
export class GuildExperience {
  constructor(
    private skillCalculator: SkillCalculator,
    private socketMessaging: SocketMessaging,
    private guildCommon: GuildCommon
  ) {}

  public async updateGuildExperience(character: ICharacter, exp: number): Promise<void> {
    try {
      // eslint-disable-next-line mongoose-lean/require-lean
      const guild = await Guild.findOne({ $or: [{ guildLeader: character._id }, { members: character._id }] });

      if (!guild) return;

      const guildSkills = await GuildSkills.findOne({ owner: guild._id }).lean<IGuildSkills>({
        virtuals: true,
        defaults: true,
      });
      if (!guildSkills) return;

      const { levelUp, newLevel } = await this.updateGuildSkills(guildSkills, exp);
      if (levelUp) {
        await this.guildCommon.notifyGuildMembers(guild.members, newLevel);
      }
    } catch (error) {
      console.error("Error updating guild experience:", error);
    }
  }

  private async updateGuildSkills(
    guildSkills: IGuildSkills,
    exp: number
  ): Promise<{ levelUp: boolean; newLevel: number }> {
    const newExperience = Math.round(guildSkills.experience + exp / 10);

    let newLevel = guildSkills.level;
    let newXpToNextLevel = guildSkills.xpToNextLevel;
    let levelUp = false;

    if (newExperience >= newXpToNextLevel) {
      newLevel++;
      newXpToNextLevel = this.skillCalculator.calculateXPToNextLevel(0, newLevel + 1) * GUILD_XP_GAIN_DIFFICULTY;
      levelUp = true;
    }

    await GuildSkills.updateOne(
      { _id: guildSkills._id },
      {
        $set: { experience: newExperience, level: newLevel, xpToNextLevel: newXpToNextLevel },
      }
    );

    return { levelUp, newLevel };
  }
}
