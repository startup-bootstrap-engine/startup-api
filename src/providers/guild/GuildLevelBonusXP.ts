import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { GUILD_XP_BONUS } from "@providers/constants/GuildConstants";
import { container } from "@providers/inversify/container";
import { NPCExperience } from "@providers/npc/NPCExperience/NPCExperience";
import { provide } from "inversify-binding-decorators";

@provide(GuildLevelBonusXP)
export class GuildLevelBonusXP {
  constructor() {}
  public async applyXPBonusForGuildLevel(character: ICharacter, guildLevel: number): Promise<void> {
    try {
      const npcExperience = container.get<NPCExperience>(NPCExperience);

      const characterSkills = (await Skill.findById(character.skills).lean()) as ISkill;
      if (!characterSkills) {
        console.error("character skills not found", character.id);
        return;
      }

      const xpBonus = GUILD_XP_BONUS * guildLevel;
      await npcExperience.updateSkillsAndSendEvents(character, characterSkills, xpBonus);
    } catch (error) {
      console.error("Error applying XP bonus for guild level", { characterId: character.id, error });
    }
  }
}
