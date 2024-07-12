import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterClassBonusOrPenalties } from "@providers/character/characterBonusPenalties/CharacterClassBonusOrPenalties";
import { CharacterBuffTracker } from "@providers/character/characterBuff/CharacterBuffTracker";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { NumberFormatter } from "@providers/text/NumberFormatter";
import { CharacterAttributes, CharacterTrait, EntityType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { SkillsAvailable } from "./SkillTypes";

export type Entity = ICharacter | INPC;

@provide(TraitGetter)
export class TraitGetter {
  constructor(
    private characterBuffTracker: CharacterBuffTracker,
    private numberFormatter: NumberFormatter,
    private characterBonusOrPenalties: CharacterClassBonusOrPenalties,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  @TrackNewRelicTransaction()
  public async getSkillLevelWithBuffs(skills: ISkill, skillName: SkillsAvailable): Promise<number> {
    if (!skills?.owner) {
      throw new Error("Skills owner is undefined");
    }

    const cacheKey = `${skills.owner}-skill-level-with-buff`;
    const cachedValue = await this.getCachedValue(cacheKey, skillName);
    if (cachedValue !== null) {
      return cachedValue;
    }

    const skillLevel = await this.getSkillLevel(skills, skillName);
    const totalBuffPercentages = await this.calculateTotalBuffPercentages(skills, skillName);

    const skillValue = skillLevel * (1 + totalBuffPercentages / 100);
    const result = this.numberFormatter.formatNumber(skillValue);

    await this.inMemoryHashTable.set(cacheKey, skillName, result);
    return result;
  }

  @TrackNewRelicTransaction()
  public async getCharacterAttributeWithBuffs(
    character: ICharacter,
    attributeName: CharacterAttributes
  ): Promise<number> {
    const totalTraitSummedBuffs = await this.characterBuffTracker.getAllBuffPercentageChanges(
      character._id,
      attributeName as CharacterTrait
    );

    const baseValue = character[attributeName];
    const traitValue = Number(baseValue + (baseValue * totalTraitSummedBuffs) / 100);

    return this.numberFormatter.formatNumber(traitValue);
  }

  private async getCachedValue(cacheKey: string, skillName: SkillsAvailable): Promise<number | null> {
    const hasCache = await this.inMemoryHashTable.has(cacheKey, skillName);
    return hasCache ? (this.inMemoryHashTable.get(cacheKey, skillName) as unknown as number) : null;
  }

  private async getSkillLevel(skills: ISkill, skillName: SkillsAvailable): Promise<number> {
    if (!skills?.level) {
      skills = await Skill.findById(skills?._id).lean();
    }

    let skillLevel = skills[skillName]?.level;
    if (!skillLevel) {
      skills = await Skill.findById(skills._id).lean();
      skillLevel = skills[skillName]?.level;
    }

    if (!skillLevel) {
      console.error(`Skill level not found for ${skills.owner} skill ${skillName}`);
      return 0;
    }

    return skillLevel;
  }

  private async calculateTotalBuffPercentages(skills: ISkill, skillName: SkillsAvailable): Promise<number> {
    const ownerStr = skills.owner?.toString() as string;

    let totalBuffPercentages = 0;

    if (skills.ownerType === EntityType.Character) {
      const [allBuffPercentageChanges, classBonusPenaltiesBuff] = await Promise.all([
        this.characterBuffTracker.getAllBuffPercentageChanges(ownerStr, skillName as CharacterTrait),
        this.characterBonusOrPenalties.getClassBonusOrPenaltiesBuffs(ownerStr),
      ]);

      if (allBuffPercentageChanges) {
        totalBuffPercentages += allBuffPercentageChanges;
      }

      if (classBonusPenaltiesBuff && classBonusPenaltiesBuff[skillName]) {
        totalBuffPercentages += classBonusPenaltiesBuff[skillName];
      }
    }

    return totalBuffPercentages;
  }
}
