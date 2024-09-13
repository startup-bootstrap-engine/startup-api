/* eslint-disable require-await */
/* eslint-disable no-void */
/* eslint-disable no-new */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterSkull } from "@providers/character/CharacterSkull";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { Locker } from "@providers/locks/Locker";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { EntityType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { BattleAttackTarget } from "../BattleAttackTarget/BattleAttackTarget";
import { BattleCycle } from "../BattleCycle";
import { BattleTargeting } from "../BattleTargeting";
import { BattleNetworkStopTargeting } from "../network/BattleNetworkStopTargetting";
import { BattleCharacterAttackIntervalSpeed } from "./BattleCharacterAttackIntervalSpeed";
import { BattleCharacterAttackValidation } from "./BattleCharacterAttackValidation";

@provide(BattleCharacterAttack)
export class BattleCharacterAttack {
  constructor(
    private battleAttackTarget: BattleAttackTarget,
    private battleCharacterAttackValidation: BattleCharacterAttackValidation,

    private battleTargeting: BattleTargeting,
    private battleNetworkStopTargeting: BattleNetworkStopTargeting,
    private characterValidation: CharacterValidation,
    private battleCycle: BattleCycle,
    private socketMessaging: SocketMessaging,
    private battleCharacterAttackIntervalSpeed: BattleCharacterAttackIntervalSpeed,
    private locker: Locker,
    private characterSkull: CharacterSkull
  ) {}

  public async onHandleCharacterBattleLoop(character: ICharacter, target: ICharacter | INPC): Promise<void> {
    if (!character || !target) {
      return;
    }

    const lockKey = `battle-loop-${character._id}`;
    const hasLocked = await this.locker.lock(lockKey);

    if (!hasLocked) {
      return;
    }

    try {
      const attackIntervalSpeed = await this.battleCharacterAttackIntervalSpeed.tryReducingAttackIntervalSpeed(
        character
      );

      await this.battleCycle.init(character, target._id, attackIntervalSpeed, async () => {
        await this.execCharacterBattleCycleLoop(character, target);
      });
    } finally {
      await this.locker.unlock(lockKey);
    }
  }

  @TrackNewRelicTransaction()
  private async execCharacterBattleCycleLoop(character: ICharacter, target: ICharacter | INPC): Promise<void> {
    const lockKey = `battle-cycle-${character._id}`;
    const hasLock = await this.locker.hasLock(lockKey);

    if (hasLock) {
      return; // Battle cycle is already running for this character
    }

    try {
      await this.locker.lock(lockKey, 5); // Lock for 5 seconds

      const updatedCharacter = await Character.findOne({ _id: character._id, scene: target.scene }).lean<ICharacter>({
        virtuals: true,
        defaults: true,
      });

      if (!updatedCharacter) {
        console.log(`Character ${character._id} not found. Stopping battle cycle.`);
        this.battleCycle.stop(character._id);
        return;
      }

      const hasBasicValidation = this.characterValidation.hasBasicValidation(updatedCharacter);

      if (!hasBasicValidation) {
        await this.battleTargeting.cancelTargeting(updatedCharacter);
        await this.battleNetworkStopTargeting.stopTargeting(updatedCharacter);
        return;
      }

      const characterSkills = await Skill.findOne({ owner: character._id })
        .lean({
          virtuals: true,
          defaults: true,
        })
        .cacheQuery({
          cacheKey: `${character._id}-skills`,
        });

      if (!characterSkills) {
        console.log(`Skills not found for character ${character._id}. Stopping battle cycle.`);
        this.battleCycle.stop(character._id);
        return;
      }

      updatedCharacter.skills = characterSkills;

      let updatedTarget;

      if (target.type === EntityType.NPC) {
        updatedTarget = await NPC.findOne({ _id: target._id, scene: target.scene }).lean({
          virtuals: true,
          defaults: true,
        });

        if (!updatedTarget) {
          console.log(`NPC target ${target._id} not found. Stopping battle cycle.`);
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
          console.log(`Character target ${target._id} not found. Stopping battle cycle.`);
          this.battleCycle.stop(character._id);
          return;
        }

        // eslint-disable-next-line mongoose-lean/require-lean
        const updatedCharacterSkills = await Skill.findOne({ owner: target._id, ownerType: "Character" }).cacheQuery({
          cacheKey: `${target._id}-skills`,
        });

        updatedTarget.skills = updatedCharacterSkills;
      }

      if (!updatedCharacter || !updatedTarget) {
        throw new Error("Failed to get updated required elements for attacking target.");
      }

      await this.attackTarget(updatedCharacter, updatedTarget);
    } finally {
      await this.locker.unlock(lockKey);
    }
  }

  @TrackNewRelicTransaction()
  public async attackTarget(character: ICharacter, target: ICharacter | INPC): Promise<boolean> {
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
  }
}
