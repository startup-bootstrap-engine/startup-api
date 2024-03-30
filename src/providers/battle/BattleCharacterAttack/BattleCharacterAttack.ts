/* eslint-disable require-await */
/* eslint-disable no-void */
/* eslint-disable no-new */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterSkull } from "@providers/character/CharacterSkull";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterWeapon } from "@providers/character/CharacterWeapon";
import { provide } from "inversify-binding-decorators";
import { BattleAttackTarget } from "../BattleAttackTarget/BattleAttackTarget";
import { BattleCycle } from "../BattleCycle";
import { BattleTargeting } from "../BattleTargeting";
import { BattleNetworkStopTargeting } from "../network/BattleNetworkStopTargetting";
import { BattleCharacterAttackValidation } from "./BattleCharacterAttackValidation";
import { EntityType } from "@rpg-engine/shared";

@provide(BattleCharacterAttack)
export class BattleCharacterAttack {
  constructor(
    private battleAttackTarget: BattleAttackTarget,
    private battleCharacterAttackValidation: BattleCharacterAttackValidation,

    private battleTargeting: BattleTargeting,
    private battleNetworkStopTargeting: BattleNetworkStopTargeting,
    private characterValidation: CharacterValidation,
    private battleCycle: BattleCycle,
    private characterWeapon: CharacterWeapon,

    private characterSkull: CharacterSkull
  ) {}

  public async onHandleCharacterBattleLoop(character: ICharacter, target: ICharacter | INPC): Promise<void> {
    if (!character || !target) {
      return;
    }

    await this.battleCycle.init(character, target._id, character.attackIntervalSpeed, async () => {
      await this.execCharacterBattleCycleLoop(character, target);
    });
  }

  @TrackNewRelicTransaction()
  private async execCharacterBattleCycleLoop(character: ICharacter, target: ICharacter | INPC): Promise<void> {
    const updatedCharacter = (await Character.findOne({ _id: character._id, scene: target.scene }).lean({
      virtuals: true,
      defaults: true,
    })) as ICharacter;

    if (!updatedCharacter) {
      this.battleCycle.stop(character._id);
      return;
    }

    const hasBasicValidation = this.characterValidation.hasBasicValidation(updatedCharacter);

    if (!hasBasicValidation) {
      await this.battleTargeting.cancelTargeting(updatedCharacter);
      await this.battleNetworkStopTargeting.stopTargeting(updatedCharacter);
      return;
    }

    const characterSkills = (await Skill.findOne({ owner: character._id })
      .lean({
        virtuals: true,
        defaults: true,
      })
      .cacheQuery({
        cacheKey: `${character._id}-skills`,
      })) as ISkill;

    updatedCharacter.skills = characterSkills;

    let updatedTarget;

    if (target.type === EntityType.NPC) {
      updatedTarget = await NPC.findOne({ _id: target._id, scene: target.scene }).lean({
        virtuals: true,
        defaults: true,
      });

      if (!updatedTarget) {
        this.battleCycle.stop(character._id);
        return;
      }

      const updatedNPCSkills = await Skill.findOne({ owner: target._id, ownerType: "NPC" })
        .lean({
          virtuals: true,
          defaults: true,
        })
        .cacheQuery({
          cacheKey: `${target._id}-skills`,
        });

      updatedTarget.skills = updatedNPCSkills;
    }

    if (target.type === EntityType.Character) {
      updatedTarget = await Character.findOne({ _id: target._id, scene: target.scene }).lean({
        virtuals: true,
        defaults: true,
      });

      if (!updatedTarget) {
        this.battleCycle.stop(character._id);
        return;
      }

      const updatedCharacterSkills = await Skill.findOne({ owner: target._id, ownerType: "Character" }).cacheQuery({
        cacheKey: `${target._id}-skills`,
      });

      updatedTarget.skills = updatedCharacterSkills;
    }

    if (!updatedCharacter || !updatedTarget) {
      throw new Error("Failed to get updated required elements for attacking target.");
    }

    await this.attackTarget(updatedCharacter, updatedTarget);
  }

  @TrackNewRelicTransaction()
  public async attackTarget(character: ICharacter, target: ICharacter | INPC): Promise<boolean> {
    try {
      const canAttack = await this.battleCharacterAttackValidation.canAttack(character, target);
      if (!canAttack) {
        return false;
      }

      if (!character) {
        return false;
      }

      const checkRangeAndAttack = await this.battleAttackTarget.checkRangeAndAttack(character, target);
      if (checkRangeAndAttack) {
        // check for skull
        if (target.type === "Character") {
          const isAttackUnjustified = await this.characterSkull.checkForUnjustifiedAttack(
            character as ICharacter,
            target as ICharacter
          );
          if (isAttackUnjustified) {
            // If the attack is not justified, the caster gains a 'skull'
            await this.characterSkull.updateWhiteSkull(character.id, target.id);
          }
        }
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
