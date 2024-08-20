import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { BattleAttackTarget } from "@providers/battle/BattleAttackTarget/BattleAttackTarget";
import { appEnv } from "@providers/config/env";
import { NPC_BATTLE_CYCLE_INTERVAL, NPC_MIN_DISTANCE_TO_ACTIVATE } from "@providers/constants/NPCConstants";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { Stealth } from "@providers/spells/data/logic/rogue/Stealth";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { NPCAlignment } from "@rpg-engine/shared";
import _ from "lodash";
import { NPCFreezer } from "./NPCFreezer";
import { NPCView } from "./NPCView";
import { ICharacterHealth } from "./movement/NPCMovementMoveTowards";
import { NPCTarget } from "./movement/NPCTarget";
@provideSingleton(NPCBattleCycleQueue)
export class NPCBattleCycleQueue {
  constructor(
    private newRelic: NewRelic,
    private locker: Locker,
    private npcTarget: NPCTarget,
    private stealth: Stealth,
    private movementHelper: MovementHelper,
    private battleAttackTarget: BattleAttackTarget,
    private npcView: NPCView,
    private dynamicQueue: DynamicQueue,
    private npcFreezer: NPCFreezer
  ) {}

  public async addToQueue(npc: INPC, npcSkills: ISkill): Promise<void> {
    const canProceed = await this.locker.lock(`npc-${npc._id}-npc-add-battle-queue`);

    if (!canProceed) {
      return;
    }

    try {
      if (appEnv.general.IS_UNIT_TEST) {
        await this.execBattleCycle(npc, npcSkills);
        return;
      }

      await this.dynamicQueue.addJob(
        "npc-battle-queue",

        async (job) => {
          const { npc, npcSkills } = job.data;

          await this.execBattleCycle(npc, npcSkills);
        },
        {
          npc,
          npcSkills,
        },
        undefined,

        {
          delay: NPC_BATTLE_CYCLE_INTERVAL,
        }
      );
    } catch (error) {
      console.error(error);
      await this.locker.unlock(`npc-${npc._id}-npc-battle-cycle`);
    } finally {
      await this.locker.unlock(`npc-${npc._id}-npc-add-battle-queue`);
    }
  }

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
  }

  @TrackNewRelicTransaction()
  private async execBattleCycle(npc: INPC, npcSkills: ISkill): Promise<void> {
    let updatedNPC = npc;

    try {
      if (!(await this.isLocked(npc))) return;

      this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.NPCs, "NPCBattleCycle", 1);

      const [fetchedNPC, targetCharacter] = await this.fetchNPCAndTarget(npc);

      updatedNPC = fetchedNPC;

      if (!updatedNPC) {
        console.error("NPC is null");
        return;
      }

      updatedNPC.skills = npcSkills;

      if (!(await this.isValidBattleState(updatedNPC, targetCharacter))) {
        await this.npcFreezer.freezeNPC(updatedNPC, "NPCBattleCycleQueue - NPC is not in a valid battle state");
        return;
      }

      await this.updateTargetCharacterSkills(targetCharacter);

      const isEligibleForAttack = await this.isEligibleForAttack(updatedNPC, targetCharacter);

      if (!isEligibleForAttack) {
        await this.npcFreezer.freezeNPC(updatedNPC, "NPCBattleCycleQueue - NPC is not eligible for attack");
        return;
      }

      await this.battleAttackTarget.checkRangeAndAttack(updatedNPC, targetCharacter);
      await this.tryToSwitchToRandomTarget(npc);
      await this.addToQueue(updatedNPC, npcSkills);
    } catch (error) {
      await this.handleError(npc, updatedNPC, error);
    }
  }

  private async isLocked(npc: INPC): Promise<boolean> {
    const hasLock = await this.locker.hasLock(`npc-${npc._id}-npc-battle-cycle`);
    return hasLock;
  }

  private async fetchNPCAndTarget(npc: INPC): Promise<[INPC, ICharacter]> {
    const [fetchedNPC, targetCharacter] = await Promise.all([
      NPC.findById(npc._id).lean({ virtuals: true, defaults: true }),
      Character.findById(npc.targetCharacter).lean({ virtuals: true, defaults: true }),
    ]);

    return [fetchedNPC as INPC, targetCharacter as ICharacter];
  }

  private isValidBattleState(npc: INPC, targetCharacter: ICharacter): boolean {
    const isUnderRange = this.movementHelper.isUnderRange(
      npc.x,
      npc.y,
      targetCharacter.x,
      targetCharacter.y,
      npc.maxRangeInGridCells || NPC_MIN_DISTANCE_TO_ACTIVATE
    );

    const isValidState =
      npc?.isBehaviorEnabled &&
      targetCharacter?.isOnline &&
      targetCharacter.health > 0 &&
      targetCharacter.scene === npc.scene &&
      isUnderRange;

    if (!isValidState) {
      return false;
    }

    return isValidState;
  }

  private async updateTargetCharacterSkills(targetCharacter: ICharacter): Promise<void> {
    const characterSkills = await Skill.findOne({
      owner: targetCharacter._id,
    })
      .lean()
      .cacheQuery({
        cacheKey: `${targetCharacter._id}-skills`,
      });

    targetCharacter.skills = characterSkills as ISkill;
  }

  private async isEligibleForAttack(npc: INPC, targetCharacter: ICharacter): Promise<boolean> {
    const isTargetInvisible = await this.stealth.isInvisible(targetCharacter);

    const hasNoTarget = !npc.targetCharacter?.toString();
    const hasDifferentTarget = npc.targetCharacter?.toString() !== targetCharacter?.id.toString();

    if (hasNoTarget || hasDifferentTarget || !targetCharacter) {
      return false;
    }

    return (
      npc?.alignment === NPCAlignment.Hostile && targetCharacter?.health > 0 && npc.health > 0 && !isTargetInvisible
    );
  }

  private async handleError(npc: INPC, updatedNPC: INPC, error: any): Promise<void> {
    await this.locker.unlock(`npc-${npc._id}-npc-battle-cycle`);
    if (!updatedNPC) {
      console.error("NPC is null");
      return;
    }

    console.error(error);
    throw error;
  }

  @TrackNewRelicTransaction()
  private async tryToSwitchToRandomTarget(npc: INPC): Promise<boolean> {
    if (npc.canSwitchToLowHealthTarget || npc.canSwitchToRandomTarget) {
      // Odds have failed, we will not change target
      if (!this.checkOdds()) return false;

      const nearbyCharacters = await this.getVisibleCharactersInView(npc);
      // Only one character around this NPC, cannot change target
      if (nearbyCharacters.length <= 1) return false;
      let alreadySet = false;

      if (npc.canSwitchToLowHealthTarget) {
        const charactersHealth: ICharacterHealth[] = [];
        for (const nearbyCharacter of nearbyCharacters) {
          if (!nearbyCharacter.isAlive) {
            continue;
          }

          charactersHealth.push({
            id: nearbyCharacter.id,
            health: nearbyCharacter.health,
          });
        }

        const minHealthCharacterInfo = _.minBy(charactersHealth, "health");
        const minHealthCharacter = (await Character.findById(minHealthCharacterInfo?.id).lean()) as ICharacter;

        // Only set as target if the minimum health character is with 25% of it's health
        if (minHealthCharacter.health <= minHealthCharacter.maxHealth / 4) {
          await this.npcTarget.setTarget(npc, minHealthCharacter);
          npc.speed += npc.speed * 0.3;
          alreadySet = true;
          return true;
        }
      }

      if (npc.canSwitchToRandomTarget && !alreadySet) {
        const randomCharacter = _.sample(nearbyCharacters);
        if (randomCharacter) await this.npcTarget.setTarget(npc, randomCharacter);
        return true;
      }
    }

    return false;
  }

  private checkOdds(): boolean {
    const random = Math.random();

    // Always have a 10% chance of returning true
    if (random < 0.1) return true;

    return false;
  }

  @TrackNewRelicTransaction()
  private async getVisibleCharactersInView(npc: INPC): Promise<ICharacter[]> {
    const chars = await this.npcView.getCharactersInView(npc);
    const visible: ICharacter[] = [];
    for (const c of chars) {
      if (!(await this.stealth.isInvisible(c))) {
        visible.push(c);
      }
    }
    return visible;
  }
}
