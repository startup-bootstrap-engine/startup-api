import { CharacterBuff, ICharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterClassBonusOrPenalties } from "@providers/character/characterBonusPenalties/CharacterClassBonusOrPenalties";
import { CharacterBuffTracker } from "@providers/character/characterBuff/CharacterBuffTracker";
import { appEnv } from "@providers/config/env";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { ResultsPoller } from "@providers/poller/ResultsPoller";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { CharacterBuffType, CharacterTrait } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";

@provide(SkillBuffQueue)
export class SkillBuffQueue {
  constructor(
    private characterBuffTracker: CharacterBuffTracker,
    private characterBonusOrPenalties: CharacterClassBonusOrPenalties,
    private inMemoryHashTable: InMemoryHashTable,
    private dynamicQueue: DynamicQueue,
    private resultsPoller: ResultsPoller
  ) {}

  public async getSkillsWithBuff(character: ICharacter): Promise<ISkill> {
    if (appEnv.general.IS_UNIT_TEST) {
      return await this.execGetSkillsWithBuff(character);
    }

    await this.dynamicQueue.addJob(
      "skills-buff",
      async (job) => {
        const { character } = job.data;

        const skills = await this.execGetSkillsWithBuff(character);

        await this.resultsPoller.prepareResultToBePolled("skills-buff-results", character._id, skills);
      },
      { character }
    );

    const result = await this.resultsPoller.pollResults("skills-buff-results", character._id);

    return result as unknown as ISkill;
  }

  @TrackNewRelicTransaction()
  public async execGetSkillsWithBuff(character: ICharacter): Promise<ISkill> {
    const skillsWithBuff = (await this.inMemoryHashTable.get("skills-with-buff", character._id)) as ISkill;

    if (skillsWithBuff) {
      return skillsWithBuff;
    }

    const skills = await this.fetchSkills(character);
    this.validateSkills(skills, character);
    const clonedSkills = _.cloneDeep(skills);

    if (clonedSkills.ownerType === "Character") {
      await this.applyBuffs(clonedSkills, character);
      await this.applyBonusesAndPenalties(clonedSkills, character);
    }

    await this.inMemoryHashTable.set("skills-with-buff", character._id, clonedSkills);

    return clonedSkills;
  }

  @TrackNewRelicTransaction()
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

  @TrackNewRelicTransaction()
  private async applyBuffs(clonedSkills: ISkill, character: ICharacter): Promise<void> {
    const buffedSkills = (await CharacterBuff.find({
      owner: clonedSkills.owner,
      type: CharacterBuffType.Skill,
    })
      .lean({ virtuals: true, defaults: true })
      .cacheQuery({ cacheKey: `characterBuffs_${clonedSkills.owner?.toString()}` })) as ICharacterBuff[];

    // Traditional loop for processing buffs
    for (const buff of buffedSkills) {
      if (buff.type === CharacterBuffType.Skill && clonedSkills[buff.trait]?.level) {
        await this.applyBuffToSkill(clonedSkills, character, buff);
      }
    }
  }

  @TrackNewRelicTransaction()
  private async applyBuffToSkill(clonedSkills: ISkill, character: ICharacter, buff: ICharacterBuff): Promise<void> {
    try {
      const buffValue = await this.characterBuffTracker.getAllBuffPercentageChanges(
        character._id,
        buff.trait as CharacterTrait
      );
      clonedSkills[buff.trait].buffAndDebuff = buffValue;
    } catch (error) {
      console.error(`Error applying buff to skill for character ${character._id} trait ${buff.trait}`, error);
    }
  }

  @TrackNewRelicTransaction()
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

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }
}
