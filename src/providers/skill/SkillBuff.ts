import { CharacterBuff, ICharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterClassBonusOrPenalties } from "@providers/character/characterBonusPenalties/CharacterClassBonusOrPenalties";
import { CharacterBuffTracker } from "@providers/character/characterBuff/CharacterBuffTracker";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { CharacterBuffType, CharacterTrait, EntityType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(SkillBuff)
export class SkillBuff {
  constructor(
    private characterBuffTracker: CharacterBuffTracker,
    private characterBonusOrPenalties: CharacterClassBonusOrPenalties,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  @TrackNewRelicTransaction()
  public async getSkillsWithBuff(character: ICharacter): Promise<ISkill> {
    const cacheKey = "skills-with-buff";
    const cachedSkills = (await this.inMemoryHashTable.get(cacheKey, character._id)) as ISkill | null;

    if (cachedSkills) {
      return cachedSkills;
    }

    const skills = await this.fetchSkills(character);
    if (!skills) {
      throw new Error(`Skills not found for character ${character._id.toString()}`);
    }

    if (skills.ownerType === EntityType.Character) {
      await this.applyBuffsAndBonuses(skills, character);
    }

    await this.inMemoryHashTable.set(cacheKey, character._id, skills);

    return skills;
  }

  private async fetchSkills(character: ICharacter): Promise<ISkill | null> {
    return await Skill.findById(character.skills)
      .lean<ISkill>({ virtuals: true, defaults: true })
      .cacheQuery({
        cacheKey: `${character._id}-skills`,
      });
  }

  private async applyBuffsAndBonuses(skills: ISkill, character: ICharacter): Promise<void> {
    const [buffedSkills, parsedBonusAndPenalties] = await Promise.all([
      this.getBuffedSkills(skills),
      this.characterBonusOrPenalties.getClassBonusOrPenaltiesBuffs(character._id),
    ]);

    const buffPromises = buffedSkills.map((buff) => this.applyBuffToSkill(skills, character, buff));
    await Promise.all(buffPromises);

    this.applyBonusesAndPenalties(skills, parsedBonusAndPenalties);
  }

  private async getBuffedSkills(skills: ISkill): Promise<ICharacterBuff[]> {
    return await CharacterBuff.find({
      owner: skills.owner,
      type: CharacterBuffType.Skill,
    })
      .lean<ICharacterBuff[]>({ virtuals: true, defaults: true })
      .cacheQuery({ cacheKey: `characterBuffs_${skills.owner?.toString()}` });
  }

  @TrackNewRelicTransaction()
  private async applyBuffToSkill(skills: ISkill, character: ICharacter, buff: ICharacterBuff): Promise<void> {
    try {
      const buffValue = await this.characterBuffTracker.getAllBuffPercentageChanges(
        character._id,
        buff.trait as CharacterTrait
      );
      const skill = skills[buff.trait as keyof ISkill] as any;
      if (skill?.level) {
        skill.buffAndDebuff = (skill.buffAndDebuff ?? 0) + buffValue;
      }
    } catch (error) {
      console.error(`Error applying buff to skill for character ${character._id} trait ${buff.trait}`, error);
    }
  }

  private applyBonusesAndPenalties(skills: ISkill, parsedBonusAndPenalties: Record<string, number>): void {
    Object.entries(parsedBonusAndPenalties).forEach(([key, value]) => {
      const skill = skills[key as keyof ISkill] as any;
      if (skill && typeof skill === "object") {
        skill.buffAndDebuff = (skill.buffAndDebuff ?? 0) + value;
        if (skill.buffAndDebuff === 0) {
          delete skill.buffAndDebuff;
        }
      }
    });
  }
}
