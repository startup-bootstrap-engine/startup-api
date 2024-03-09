import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { DiscordBot } from "@providers/discord/DiscordBot";
import { SkillUpdaterQueue } from "@providers/skill/SkillUpdaterQueue";
import { ICraftingSkillsBonusAndPenalties, IIncreaseSPResult } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(CharacterCraftingBonusPenalties)
export class CharacterCraftingBonusPenalties {
  constructor(private skillFunctions: SkillUpdaterQueue, private discordBot: DiscordBot) {}

  @TrackNewRelicTransaction()
  public async updateCraftingSkills(
    skills: ISkill,
    skillName: string,
    bonusOrPenalties: ICraftingSkillsBonusAndPenalties
  ): Promise<IIncreaseSPResult> {
    let skillLevelUp: boolean = false;

    let skillSpData: IIncreaseSPResult = {
      skillLevelUp: false,
      skillLevelBefore: skills[skillName].level,
      skillLevelAfter: 0,
      skillName: "",
      skillPoints: 0,
    };

    switch (skillName) {
      case "fishing": {
        skillLevelUp = await this.skillFunctions.updateSkillByType(
          skills,
          skillName,
          this.skillFunctions.calculateBonusOrPenaltiesSP(bonusOrPenalties.fishing, skills[skillName].level)
        );

        skillSpData = {
          skillLevelUp: skillLevelUp,
          skillLevelBefore: skillSpData.skillLevelBefore,
          skillLevelAfter: skills[skillName].level,
          skillName: skillName,
          skillPoints: skills[skillName].skillPoints,
        };

        break;
      }

      case "mining": {
        skillLevelUp = await this.skillFunctions.updateSkillByType(
          skills,
          skillName,
          this.skillFunctions.calculateBonusOrPenaltiesSP(bonusOrPenalties.mining, skills[skillName].level)
        );

        skillSpData = {
          skillLevelUp: skillLevelUp,
          skillLevelBefore: skillSpData.skillLevelBefore,
          skillLevelAfter: skills[skillName].level,
          skillName: skillName,
          skillPoints: skills[skillName].skillPoints,
        };

        break;
      }

      case "lumberjacking": {
        skillLevelUp = await this.skillFunctions.updateSkillByType(
          skills,
          skillName,
          this.skillFunctions.calculateBonusOrPenaltiesSP(bonusOrPenalties.lumberjacking, skills[skillName].level)
        );

        skillSpData = {
          skillLevelUp: skillLevelUp,
          skillLevelBefore: skillSpData.skillLevelBefore,
          skillLevelAfter: skills[skillName].level,
          skillName: skillName,
          skillPoints: skills[skillName].skillPoints,
        };

        break;
      }

      case "cooking": {
        skillLevelUp = await this.skillFunctions.updateSkillByType(
          skills,
          skillName,
          this.skillFunctions.calculateBonusOrPenaltiesSP(bonusOrPenalties.cooking, skills[skillName].level)
        );

        skillSpData = {
          skillLevelUp: skillLevelUp,
          skillLevelBefore: skillSpData.skillLevelBefore,
          skillLevelAfter: skills[skillName].level,
          skillName: skillName,
          skillPoints: skills[skillName].skillPoints,
        };

        break;
      }

      case "alchemy": {
        skillLevelUp = await this.skillFunctions.updateSkillByType(
          skills,
          skillName,
          this.skillFunctions.calculateBonusOrPenaltiesSP(bonusOrPenalties.alchemy, skills[skillName].level)
        );

        skillSpData = {
          skillLevelUp: skillLevelUp,
          skillLevelBefore: skillSpData.skillLevelBefore,
          skillLevelAfter: skills[skillName].level,
          skillName: skillName,
          skillPoints: skills[skillName].skillPoints,
        };

        break;
      }

      case "blacksmithing": {
        skillLevelUp = await this.skillFunctions.updateSkillByType(
          skills,
          skillName,
          this.skillFunctions.calculateBonusOrPenaltiesSP(bonusOrPenalties.blacksmithing, skills[skillName].level)
        );

        skillSpData = {
          skillLevelUp: skillLevelUp,
          skillLevelBefore: skillSpData.skillLevelBefore,
          skillLevelAfter: skills[skillName].level,
          skillName: skillName,
          skillPoints: skills[skillName].skillPoints,
        };

        break;
      }

      default:
        break;
    }

    const char = (await Character.findById(skills.owner).lean()) as ICharacter;
    await this.skillFunctions.updateSkills(skills, char);

    const isMultipleOfTen = skillSpData.skillLevelAfter % 10 === 0;

    if (skillLevelUp && isMultipleOfTen) {
      const message = this.discordBot.getRandomLevelUpMessage(
        char.name,
        skillSpData.skillLevelAfter,
        skillSpData.skillName
      );
      const channel = "achievements";
      const title = "Skill Level Up!";

      await this.discordBot.sendMessageWithColor(message, channel, title);
    }

    return skillSpData;
  }
}
