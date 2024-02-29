import { CharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterClassBonusOrPenalties } from "@providers/character/characterBonusPenalties/CharacterClassBonusOrPenalties";
import { CharacterBuffTracker } from "@providers/character/characterBuff/CharacterBuffTracker";
import { CharacterBuffType, CharacterTrait } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";

@provide(SkillBuff)
export class SkillBuff {
  constructor(
    private characterBuffTracker: CharacterBuffTracker,
    private characterBonusOrPenalties: CharacterClassBonusOrPenalties
  ) {}

  @TrackNewRelicTransaction()
  public async getSkillsWithBuff(character: ICharacter): Promise<ISkill> {
    const skills = await this.fetchSkills(character);
    this.validateSkills(skills, character);
    const clonedSkills = _.cloneDeep(skills);

    if (clonedSkills.ownerType === "Character") {
      await this.applyBuffs(clonedSkills, character);
      await this.applyBonusesAndPenalties(clonedSkills, character);
    }

    return clonedSkills;
  }

  private async fetchSkills(character: ICharacter): Promise<ISkill> {
    return (await Skill.findById(character.skills)
      .lean({ virtuals: true, defaults: true })
      .cacheQuery({
        cacheKey: `${character._id}-skills`,
      })) as ISkill;
  }

  private validateSkills(skills: ISkill, character: ICharacter): void {
    if (!skills) {
      throw new Error(`Skills not found for character ${character._id.toString()}`);
    }
  }

  private async applyBuffs(clonedSkills: ISkill, character: ICharacter): Promise<void> {
    const buffedSkills = await CharacterBuff.find({
      owner: clonedSkills.owner,
      type: CharacterBuffType.Skill,
    })
      .lean({
        virtuals: true,
        defaults: true,
      })
      .cacheQuery({
        cacheKey: `characterBuffs_${clonedSkills.owner?.toString()}`,
      });

    for (const buff of buffedSkills) {
      if (buff.type !== CharacterBuffType.Skill) continue;
      if (!clonedSkills[buff.trait]?.level) {
        console.log(`Skill not found for character ${character._id} trait ${buff.trait}`);
        continue;
      }

      clonedSkills[buff.trait].buffAndDebuff = await this.characterBuffTracker.getAllBuffPercentageChanges(
        character._id,
        buff.trait as CharacterTrait
      );
    }
  }

  private async applyBonusesAndPenalties(clonedSkills: ISkill, character: ICharacter): Promise<void> {
    const parsedBonusAndPenalties = await this.characterBonusOrPenalties.getClassBonusOrPenaltiesBuffs(character._id);

    for (const [key, value] of Object.entries(parsedBonusAndPenalties)) {
      if (!clonedSkills[key]) continue;

      const currentValue = clonedSkills[key].buffAndDebuff ?? 0;
      clonedSkills[key].buffAndDebuff = currentValue + value;

      if (clonedSkills[key].buffAndDebuff === 0) {
        delete clonedSkills[key].buffAndDebuff;
      }
    }
  }
}
