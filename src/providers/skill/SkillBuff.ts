import { CharacterBuff, ICharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterClassBonusOrPenalties } from "@providers/character/characterBonusPenalties/CharacterClassBonusOrPenalties";
import { CharacterBuffTracker } from "@providers/character/characterBuff/CharacterBuffTracker";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { CharacterBuffType, CharacterTrait } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";

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

    const clonedSkills = _.cloneDeep(skills);

    if (clonedSkills.ownerType === "Character") {
      await Promise.all([
        this.applyBuffs(clonedSkills, character),
        this.applyBonusesAndPenalties(clonedSkills, character),
      ]);
    }

    await this.inMemoryHashTable.set(cacheKey, character._id, clonedSkills);

    return clonedSkills;
  }

  private async fetchSkills(character: ICharacter): Promise<ISkill | null> {
    return await Skill.findById(character.skills)
      .lean<ISkill>({ virtuals: true, defaults: true })
      .cacheQuery({
        cacheKey: `${character._id}-skills`,
      });
  }

  private async applyBuffs(clonedSkills: ISkill, character: ICharacter): Promise<void> {
    const buffedSkills = (await CharacterBuff.find({
      owner: clonedSkills.owner,
      type: CharacterBuffType.Skill,
    })
      .lean({ virtuals: true, defaults: true })
      .cacheQuery({ cacheKey: `characterBuffs_${clonedSkills.owner?.toString()}` })) as ICharacterBuff[];

    const buffPromises = buffedSkills
      .filter((buff) => buff.type === CharacterBuffType.Skill && clonedSkills[buff.trait as keyof ISkill]?.level)
      .map((buff) => this.applyBuffToSkill(clonedSkills, character, buff));

    await Promise.all(buffPromises);
  }

  @TrackNewRelicTransaction()
  private async applyBuffToSkill(clonedSkills: ISkill, character: ICharacter, buff: ICharacterBuff): Promise<void> {
    try {
      const buffValue = await this.characterBuffTracker.getAllBuffPercentageChanges(
        character._id,
        buff.trait as CharacterTrait
      );
      if (clonedSkills[buff.trait as keyof ISkill]) {
        (clonedSkills[buff.trait as keyof ISkill] as any).buffAndDebuff = buffValue;
      }
    } catch (error) {
      console.error(`Error applying buff to skill for character ${character._id} trait ${buff.trait}`, error);
    }
  }

  private async applyBonusesAndPenalties(clonedSkills: ISkill, character: ICharacter): Promise<void> {
    const parsedBonusAndPenalties = await this.characterBonusOrPenalties.getClassBonusOrPenaltiesBuffs(character._id);

    Object.entries(parsedBonusAndPenalties).forEach(([key, value]) => {
      const skillKey = key as keyof ISkill;
      if (clonedSkills[skillKey] && typeof clonedSkills[skillKey] === "object") {
        const skill = clonedSkills[skillKey] as any;
        const currentValue = skill.buffAndDebuff ?? 0;
        const newValue = currentValue + value;
        if (newValue !== 0) {
          skill.buffAndDebuff = newValue;
        } else {
          delete skill.buffAndDebuff;
        }
      }
    });
  }
}
