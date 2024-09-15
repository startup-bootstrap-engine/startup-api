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
import { MessagingBroker } from "@providers/microservice/messaging-broker/MessagingBrokerMessaging";
import {
  MessagingBrokerActions,
  MessagingBrokerServices,
} from "@providers/microservice/messaging-broker/MessagingBrokerTypes";
import { Cooldown } from "@providers/time/Cooldown";
import { Time } from "@providers/time/Time";
import { EntityType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { BattleAttackTarget } from "../BattleAttackTarget/BattleAttackTarget";
import { BattleCycleManager } from "../BattleCycleManager";
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
    private battleCycleManager: BattleCycleManager,
    private battleCharacterAttackIntervalSpeed: BattleCharacterAttackIntervalSpeed,
    private locker: Locker,
    private characterSkull: CharacterSkull,
    private cooldown: Cooldown,
    private time: Time,
    private messagingBroker: MessagingBroker
  ) {}

  /**
   * Handles the character battle loop, ensuring cooldowns are respected,
   * attack intervals are not duplicated, and target switches are managed properly.
   */

  public async setupListeners(): Promise<void> {
    await this.messagingBroker.listenForMessages(
      MessagingBrokerServices.BattleCycle,
      MessagingBrokerActions.BattleCycleAttack,
      async (data) => {
        const { characterId, targetId, targetType, targetScene } = data;
        const character = await this.getCharacterById(characterId, targetScene, true);
        const target = await this.getTargetById(targetId, targetType);

        if (!character || !target) {
          return;
        }

        await this.execCharacterBattleCycleLoop(character, target);
      }
    );
  }

  public async onHandleCharacterBattleLoop(character: ICharacter, target: ICharacter | INPC): Promise<void> {
    if (!character || !target) {
      return;
    }

    const lockKey = `battle-loop-${character._id}`;
    const hasLocked = await this.locker.lock(lockKey);

    if (!hasLocked) {
      // Another loop is already handling this character
      return;
    }

    try {
      // Check if the character is already in a battle cycle
      const hasBattleCycle = await this.battleCycleManager.hasBattleCycle(character._id);

      if (hasBattleCycle) {
        // Update the target in the battle cycle manager
        await this.battleCycleManager.updateBattleCycleTarget(character._id, target._id, target.type as EntityType);
      } else {
        // Start a new battle cycle
        await this.battleCycleManager.startBattleCycle(character._id, target._id, target.type as EntityType);

        // Start the attack loop
        void this.execCharacterBattleCycleLoop(character, target);
      }
    } finally {
      // Release the lock
      await this.locker.unlock(lockKey);
    }
  }

  /**
   * Executes the battle cycle loop ensuring cooldowns are respected and attack intervals are not duplicated.
   */
  @TrackNewRelicTransaction()
  private async execCharacterBattleCycleLoop(character: ICharacter, target: ICharacter | INPC): Promise<void> {
    const lockKey = `battle-cycle-${character._id}`;
    const hasLocked = await this.locker.lock(lockKey);

    if (!hasLocked) {
      // Another battle cycle is already running for this character
      return;
    }

    try {
      const cooldownKey = `battle-cycle-cooldown-${character._id}`;

      const hasBattleCycle = await this.battleCycleManager.hasBattleCycle(character._id);

      if (hasBattleCycle) {
        // Determine the attack interval speed, potentially reducing it based on character stats
        const attackIntervalSpeed = await this.battleCharacterAttackIntervalSpeed.tryReducingAttackIntervalSpeed(
          character
        );

        // Retrieve the updated target
        const targetData = await this.battleCycleManager.getCurrentTarget(character._id);
        if (!targetData) {
          await this.stopBattleCycleWithLogging(character._id, "No target data.");
          return;
        }

        const updatedTarget = await this.getTargetById(targetData.targetId, targetData.targetType);
        if (!updatedTarget) {
          await this.stopBattleCycleWithLogging(character._id, "Target not found.");
          return;
        }

        if (updatedTarget.health <= 0) {
          await this.stopBattleCycleWithLogging(character._id, "Target is dead.");
          return;
        }

        const updatedCharacter = (await this.getCharacterById(character._id, updatedTarget.scene, true)) as ICharacter;

        if (!updatedCharacter) {
          return;
        }

        const hasBasicValidation = this.characterValidation.hasBasicValidation(updatedCharacter);

        if (!hasBasicValidation) {
          await this.battleTargeting.cancelTargeting(updatedCharacter);
          await this.battleNetworkStopTargeting.stopTargeting(updatedCharacter);
          return;
        }

        // Check remaining cooldown
        const remainingCooldown = await this.cooldown.getRemainingCooldownTime(cooldownKey);

        if (remainingCooldown > 0) {
          // Wait for the cooldown
          await this.time.waitForMilliseconds(remainingCooldown);
        }

        // Set the cooldown for the next attack
        await this.cooldown.setCooldown(cooldownKey, attackIntervalSpeed / 1000);

        // Perform the attack
        const attackSuccess = await this.attackTarget(updatedCharacter, updatedTarget);

        if (!attackSuccess) {
          // Attack failed, stop battle cycle
          await this.stopBattleCycleWithLogging(updatedCharacter._id, "Attack failed.");
          return;
        }

        // Wait for attack interval
        await this.time.waitForMilliseconds(attackIntervalSpeed);

        // trigger the next attack
        await this.messagingBroker.sendMessage(
          MessagingBrokerServices.BattleCycle,
          MessagingBrokerActions.BattleCycleAttack,
          {
            characterId: updatedCharacter._id,
            targetId: updatedTarget._id,
            targetType: updatedTarget.type,
            targetScene: updatedTarget.scene,
          }
        );
      }
    } finally {
      // Release the lock
      await this.locker.unlock(lockKey);
    }
  }

  /**
   * Retrieves a character by ID with necessary fields.
   */
  private async getCharacterById(
    characterId: string,
    scene: string,
    withSkills: boolean = false
  ): Promise<ICharacter | undefined> {
    const character = await Character.findOne({ _id: characterId, scene }).lean<ICharacter>({
      virtuals: true,
      defaults: true,
    });

    if (!character) {
      await this.battleCycleManager.stopBattleCycle(characterId);
      return;
    }

    if (withSkills) {
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
        await this.battleCycleManager.stopBattleCycle(character._id);
        return;
      }

      character.skills = characterSkills;
    }

    return character;
  }

  /**
   * Retrieves a target (Character or NPC) by ID and type with necessary fields.
   */
  private async getTargetById(targetId: string, targetType: EntityType): Promise<ICharacter | INPC | null> {
    let target: ICharacter | INPC | null = null;
    let skills: any = null;

    switch (targetType) {
      case EntityType.Character:
        target = await Character.findOne({ _id: targetId }).lean<ICharacter>({
          virtuals: true,
          defaults: true,
        });
        break;
      case EntityType.NPC:
        target = await NPC.findOne({ _id: targetId }).lean<INPC>({
          virtuals: true,
          defaults: true,
        });
        break;
      default:
        return null;
    }

    if (target) {
      skills = await Skill.findOne({ owner: target._id })
        .lean({
          virtuals: true,
          defaults: true,
        })
        .cacheQuery({
          cacheKey: `${target._id}-skills`,
        });

      if (skills) {
        target.skills = skills;
      }
    }

    return target;
  }

  /**
   * Stops the battle cycle and logs the reason.
   */
  private async stopBattleCycleWithLogging(characterId: string, reason: string): Promise<void> {
    console.log(`Stopping battle cycle for character ${characterId}: ${reason}`);
    await this.battleCycleManager.stopBattleCycle(characterId);
  }

  /**
   * Handles the actual attack on the target.
   * Ensures validations and updates skulls if necessary.
   */
  @TrackNewRelicTransaction()
  public async attackTarget(character: ICharacter, target: ICharacter | INPC): Promise<boolean> {
    // Validate if the character can attack the target
    const canAttack = await this.battleCharacterAttackValidation.canAttack(character, target);
    if (!canAttack) {
      return false;
    }

    // Perform range check and execute the attack
    const attackSuccessful = await this.battleAttackTarget.checkRangeAndAttack(character, target);
    if (attackSuccessful) {
      // If attacking another character, check for unjustified attacks
      if (target.type === EntityType.Character) {
        const isAttackUnjustified = await this.characterSkull.checkForUnjustifiedAttack(
          character as ICharacter,
          target as ICharacter
        );
        if (isAttackUnjustified) {
          // Update skulls accordingly
          await this.characterSkull.updateWhiteSkull(character.id, target.id);
        }
      }
      return true;
    }

    return false;
  }
}
