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
    private dynamicQueue: DynamicQueue
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
        {
          queueScaleBy: "active-npcs",
        },

        {
          delay: NPC_BATTLE_CYCLE_INTERVAL,
          priority: 1,
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
      const hasLock = await this.locker.hasLock(`npc-${npc._id}-npc-battle-cycle`);

      if (!hasLock) {
        return;
      }

      this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.NPCs, "NPCBattleCycle", 1);

      const result = await Promise.all([
        NPC.findById(npc.id).lean({ virtuals: true, defaults: true }),
        Character.findById(npc.targetCharacter).lean({ virtuals: true, defaults: true }),
      ]);

      const targetCharacter = result[1] as ICharacter;
      updatedNPC = result[0] as INPC;
      updatedNPC.skills = npcSkills;

      const isUnderRange = this.movementHelper.isUnderRange(
        updatedNPC.x,
        updatedNPC.y,
        targetCharacter.x,
        targetCharacter.y,
        updatedNPC.maxRangeInGridCells || NPC_MIN_DISTANCE_TO_ACTIVATE
      );

      if (
        !updatedNPC?.isBehaviorEnabled ||
        !targetCharacter ||
        !targetCharacter.isOnline ||
        targetCharacter.health <= 0 ||
        targetCharacter.scene !== updatedNPC.scene ||
        !isUnderRange
      ) {
        await this.stop(npc);

        return;
      }

      const hasNoTarget = !updatedNPC.targetCharacter?.toString();
      const hasDifferentTarget = updatedNPC.targetCharacter?.toString() !== targetCharacter?.id.toString();

      if (hasNoTarget || hasDifferentTarget || !targetCharacter) {
        await this.stop(npc);

        return;
      }

      const characterSkills = (await Skill.findOne({
        owner: targetCharacter._id,
      })
        .lean()
        .cacheQuery({
          cacheKey: `${targetCharacter._id}-skills`,
        })) as ISkill;

      targetCharacter.skills = characterSkills;

      const isTargetInvisible = await this.stealth.isInvisible(targetCharacter);

      if (
        updatedNPC?.alignment === NPCAlignment.Hostile &&
        targetCharacter?.health > 0 &&
        updatedNPC.health > 0 &&
        !isTargetInvisible
      ) {
        // if reached target and alignment is enemy, lets hit it
        await this.battleAttackTarget.checkRangeAndAttack(updatedNPC, targetCharacter);
        await this.tryToSwitchToRandomTarget(npc);
      }

      await this.addToQueue(updatedNPC, npcSkills);
    } catch (error) {
      if (!updatedNPC) {
        console.error("NPC is null");
        return;
      }

      console.error(error);
      await this.locker.unlock(`npc-${npc._id}-npc-battle-cycle`);

      await this.addToQueue(updatedNPC, npcSkills);
    }
  }

  @TrackNewRelicTransaction()
  private async stop(npc: INPC): Promise<void> {
    await this.npcTarget.clearTarget(npc);
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
