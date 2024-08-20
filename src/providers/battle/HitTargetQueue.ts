/* eslint-disable no-void */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment } from "@entities/ModuleCharacter/EquipmentModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterView } from "@providers/character/CharacterView";
import { CharacterWeapon, ICharacterWeaponResult } from "@providers/character/CharacterWeapon";
import { CharacterMovementWarn } from "@providers/character/characterMovement/CharacterMovementWarn";
import { EntityEffectUse } from "@providers/entityEffects/EntityEffectUse";
import { NPCWarn } from "@providers/npc/NPCWarn";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { Bloodthirst } from "@providers/spells/data/logic/berserker/Bloodthirst";
import { ManaShield } from "@providers/spells/data/logic/mage/ManaShield";
import {
  BasicAttribute,
  BattleEventType,
  BattleSocketEvents,
  CharacterClass,
  EntityAttackType,
  EntityType,
  IBattleEventFromServer,
  ItemSubType,
} from "@rpg-engine/shared";

import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { appEnv } from "@providers/config/env";
import { BONUS_DAMAGE_MULTIPLIER, GENERATE_BLOOD_GROUND_ON_HIT } from "@providers/constants/BattleConstants";
import { blueprintManager } from "@providers/inversify/container";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { NPCTarget } from "@providers/npc/movement/NPCTarget";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import random from "lodash/random";
import { BattleAttackTargetDeath } from "./BattleAttackTarget/BattleAttackTargetDeath";
import { BattleDamageCalculator } from "./BattleDamageCalculator";
import { BattleEffects } from "./BattleEffects";
import { BattleEvent } from "./BattleEvent";

@provideSingleton(HitTargetQueue)
export class HitTargetQueue {
  constructor(
    private battleEvent: BattleEvent,
    private skillIncrease: SkillIncrease,
    private battleAttackTargetDeath: BattleAttackTargetDeath,
    private manaShield: ManaShield,
    private bloodthirst: Bloodthirst,
    private battleEffects: BattleEffects,
    private characterWeapon: CharacterWeapon,
    private characterView: CharacterView,
    private npcWarn: NPCWarn,
    private characterMovementWarn: CharacterMovementWarn,
    private socketMessaging: SocketMessaging,
    private entityEffectUse: EntityEffectUse,
    private battleDamageCalculator: BattleDamageCalculator,
    private locker: Locker,
    private dynamicQueue: DynamicQueue,
    private npcTarget: NPCTarget
  ) {}

  public async hit(
    attacker: ICharacter | INPC,
    target: ICharacter | INPC,
    magicAttack?: boolean,
    bonusDamage?: number,
    spellHit?: boolean
  ): Promise<void> {
    if (appEnv.general.IS_UNIT_TEST) {
      await this.execHit(attacker, target, magicAttack, bonusDamage, spellHit);
      return;
    }

    if (!attacker || !target) {
      return;
    }

    const targetType = target.type; // we have to pass this separately because the queue will not read the virtual field later

    if (attacker.type === EntityType.Character) {
      await this.dynamicQueue.addJob(
        "character-hit-queue",
        async (job) => {
          const { attacker, target, targetType, magicAttack, bonusDamage, spellHit } = job.data;

          target.type = targetType;

          // make sure that if the target is an NPC and it doesn't have a target, we set the target as the attacker
          if (
            attacker.type === EntityType.Character &&
            target.type === EntityType.NPC &&
            !(target as INPC).targetCharacter
          ) {
            await this.npcTarget.setTarget(target as INPC, attacker as ICharacter);
          }

          await this.execHit(attacker, target, magicAttack, bonusDamage, spellHit);
        },
        { attacker, target, targetType, magicAttack, bonusDamage, spellHit },
        undefined
      );
    } else {
      await this.dynamicQueue.addJob(
        "npc-hit-queue",
        async (job) => {
          const { attacker, target, targetType, magicAttack, bonusDamage, spellHit } = job.data;

          target.type = targetType;

          const hasLock =
            (await this.locker.hasLock(`${target._id}-applying-usable-effect`)) ||
            (await this.locker.hasLock(`${target._id}-healing-target`));

          if (hasLock) {
            return;
          }

          await this.execHit(attacker, target, magicAttack, bonusDamage, spellHit);
        },
        { attacker, target, targetType, magicAttack, bonusDamage, spellHit },
        {
          queueScaleBy: "active-npcs",
        }
      );
    }
  }

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
  }

  @TrackNewRelicTransaction()
  public async execHit(
    attacker: ICharacter | INPC,
    target: ICharacter | INPC,
    magicAttack?: boolean,
    bonusDamage?: number,
    spellHit?: boolean
  ): Promise<void> {
    target.isAlive = target.health > 0;
    if (!target?.isAlive) return;

    const battleEvent: BattleEventType = magicAttack
      ? BattleEventType.Hit
      : await this.battleEvent.calculateEvent(attacker, target);

    let battleEventPayload: Partial<IBattleEventFromServer> = {
      attackerId: attacker._id,
      attackerType: attacker.type as EntityType.Character | EntityType.NPC,
      targetId: target._id,
      targetType: target.type as EntityType.Character | EntityType.NPC,
      eventType: battleEvent,
    };

    if (battleEvent === BattleEventType.Hit) {
      const { damage, baseDamage, lastestHealth } = await this.getCalculatedDamage(
        attacker,
        target,
        bonusDamage!,
        magicAttack!
      );

      const damageRelatedPromises: any[] = [];

      if (damage > 0) {
        const manaShieldActive = await this.manaShield.hasManaShield(target as ICharacter);

        if (!manaShieldActive || !(await this.manaShield.handleManaShield(target as ICharacter, damage))) {
          await this.handleDamage(attacker, target, damage, lastestHealth, spellHit, damageRelatedPromises);
        }

        if (attacker.type === EntityType.NPC && target.type === EntityType.Character) {
          await this.handleNPCTargetAttackSkillIncreaseAndEffects(
            attacker as INPC,
            target as ICharacter,
            damageRelatedPromises
          );
        }

        const weapon = (await this.characterWeapon.getWeapon(
          attacker as ICharacter
        )) as unknown as ICharacterWeaponResult;
        this.handleCharacterAttackerSkillIncreaseAndEffects(weapon, target, damageRelatedPromises);

        if (attacker.type === EntityType.Character && target.health > 0) {
          await this.applyEntityEffectsCharacter(attacker as ICharacter, weapon, target);
        }

        if (random(1, 100) <= GENERATE_BLOOD_GROUND_ON_HIT) {
          damageRelatedPromises.push(this.battleEffects.generateBloodOnGround(target));
        }

        battleEventPayload = {
          ...battleEventPayload,
          totalDamage: damage,
          postDamageTargetHP: target.health,
          isCriticalHit: damage > baseDamage,
        };

        await Promise.all(damageRelatedPromises);
      }
    }

    await this.handleRemainingEvents(attacker, target, battleEvent, battleEventPayload);
    await this.battleAttackTargetDeath.handleDeathAfterHit(attacker, target);
  }

  private async handleDamage(
    attacker: ICharacter | INPC,
    target: ICharacter | INPC,
    damage: number,
    latestHealth: number,
    spellHit: boolean | undefined,
    damageRelatedPromises: any[]
  ): Promise<void> {
    if (attacker.type === EntityType.Character) {
      const character = attacker as ICharacter;
      await this.skillIncrease.increaseSkillsOnBattle(character, target, damage, spellHit);

      if (attacker.class === CharacterClass.Berserker) {
        const berserkerSpell = await this.bloodthirst.getBerserkerBloodthirstSpell(character);
        if (berserkerSpell) {
          damageRelatedPromises.push(this.bloodthirst.handleBerserkerAttack(character, damage));
        }
      }
    }

    if (target.type === EntityType.NPC) {
      await this.updateTargetHealth(target, latestHealth, damage);
    } else if (target.type === EntityType.Character) {
      await this.handleCharacterTarget(target as ICharacter, latestHealth, damage);
    }
  }

  private async handleCharacterTarget(target: ICharacter, latestHealth: number, damage: number): Promise<void> {
    try {
      const canProceed = await this.locker.lock(`handle-character-target-${target._id}`);

      if (!canProceed) {
        return;
      }

      let sorcererManaShield = false;

      if ([CharacterClass.Sorcerer, CharacterClass.Druid].includes(target.class as CharacterClass)) {
        const hasManaShieldSpell = await this.manaShield.hasManaShield(target);

        if (hasManaShieldSpell) {
          sorcererManaShield = await this.manaShield.handleManaShield(target, damage);
        }
      }

      if (!sorcererManaShield) {
        await this.updateTargetHealth(target, latestHealth, damage);
      }
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`handle-character-target-${target._id}`);
    }
  }

  private async updateTargetHealth(target: ICharacter | INPC, lastestHealth: number, damage: number): Promise<void> {
    const newTargetHealth = Math.max(lastestHealth - damage, 0);
    target.health = newTargetHealth;
    target.isAlive = newTargetHealth > 0;

    await this.updateHealthInDatabase(target, target.health);
  }

  private async handleRemainingEvents(
    attacker: ICharacter | INPC,
    target: ICharacter | INPC,
    battleEvent: BattleEventType,
    battleEventPayload: Partial<IBattleEventFromServer>
  ): Promise<void> {
    const remainingPromises: any[] = [];

    if (battleEvent === BattleEventType.Block && target.type === EntityType.Character) {
      remainingPromises.push(this.skillIncrease.increaseShieldingSP(target as ICharacter));
    }

    if (battleEvent === BattleEventType.Miss && target.type === EntityType.Character) {
      remainingPromises.push(
        this.skillIncrease.increaseBasicAttributeSP(target as ICharacter, BasicAttribute.Dexterity)
      );
    }

    remainingPromises.push(this.warnCharacterIfNotInView(attacker as ICharacter, target));

    const character = attacker.type === EntityType.Character ? (attacker as ICharacter) : (target as ICharacter);
    remainingPromises.push(this.sendBattleEvent(character, battleEventPayload as IBattleEventFromServer));

    await Promise.all(remainingPromises);
  }

  private async handleNPCTargetAttackSkillIncreaseAndEffects(
    attacker: INPC,
    target: ICharacter,
    damageRelatedPromises: Promise<any>[]
  ): Promise<void> {
    const npc = await blueprintManager.getBlueprint<any>("npcs", attacker.baseKey);

    if (npc?.isMagic && (npc?.attackType === EntityAttackType.MeleeRanged || EntityAttackType.Ranged)) {
      if (!npc?.skills?.magic?.level) {
        const skills = await Skill.findOne({ owner: attacker._id }).lean();

        if (skills) {
          npc.skills = skills;
        }
      }

      const npcMagicLevel = npc?.skills?.magic?.level ?? 15;
      const power = Math.max(15, npcMagicLevel);

      damageRelatedPromises.push(this.skillIncrease.increaseMagicResistanceSP(target, power));
    }

    if (target.isAlive) {
      damageRelatedPromises.push(this.applyEntityEffectsIfApplicable(attacker, target));
    }
  }

  private handleCharacterAttackerSkillIncreaseAndEffects(
    weapon: ICharacterWeaponResult,

    target: ICharacter | INPC,
    damageRelatedPromises: Promise<any>[]
  ): void {
    if (target.type === EntityType.NPC) {
      return;
    }

    if (
      (weapon?.item && weapon?.item.subType === ItemSubType.Magic) ||
      (weapon?.item && weapon?.item.subType === ItemSubType.Staff)
    ) {
      damageRelatedPromises.push(
        this.skillIncrease.increaseMagicResistanceSP(target as ICharacter, this.getPower(weapon?.item))
      );
    } else {
      damageRelatedPromises.push(
        this.skillIncrease.increaseBasicAttributeSP(target as ICharacter, BasicAttribute.Resistance)
      );
    }
  }

  private async getCalculatedDamage(
    attacker: ICharacter | INPC,
    target: ICharacter | INPC,
    bonusDamage: number,
    magicAttack: boolean
  ): Promise<{
    damage: number;
    baseDamage: number;
    lastestHealth: number;
  }> {
    let baseDamage = await this.battleDamageCalculator.calculateHitDamage(attacker, target, magicAttack);

    if (bonusDamage) {
      baseDamage += bonusDamage * BONUS_DAMAGE_MULTIPLIER;
    }

    let damage = this.battleDamageCalculator.getCriticalHitDamageIfSucceed(baseDamage);
    const lastestHealth = await this.fetchLatestHealth(target);
    target.health = lastestHealth;
    const maxDamage = lastestHealth;
    damage = Math.min(damage, maxDamage);

    if (isNaN(damage)) {
      damage = 0;
      console.error(`Damage is NaN for attacker: ${attacker._id} and target: ${target._id} - ${target.type}`);
    }

    return { damage, baseDamage, lastestHealth };
  }

  private async fetchLatestHealth(target: ICharacter | INPC): Promise<number> {
    let data;
    switch (target.type) {
      case EntityType.Character:
        data = await Character.findOne({ _id: target._id, scene: target.scene }).lean().select("health");
        break;
      case EntityType.NPC:
        data = await NPC.findOne({ _id: target._id, scene: target.scene }).lean().select("health");
        break;
      default:
        throw new Error(`Invalid target type: ${target.type}`);
    }

    return data?.health ?? target.health;
  }

  private async updateHealthInDatabase(target: ICharacter | INPC, health: number): Promise<void> {
    const updatePayload = { health };

    switch (target.type) {
      case EntityType.Character:
        (await Character.updateOne({ _id: target._id, scene: target.scene }, updatePayload).lean()) as ICharacter;
        break;
      case EntityType.NPC:
        (await NPC.updateOne({ _id: target._id, scene: target.scene }, updatePayload).lean()) as INPC;
        break;
      default:
        throw new Error(`Invalid target type: ${target.type}`);
    }
  }

  private async sendBattleEvent(character: ICharacter, battleEventPayload: IBattleEventFromServer): Promise<void> {
    await this.socketMessaging.sendEventToCharactersAroundCharacter(
      character,
      BattleSocketEvents.BattleEvent,
      battleEventPayload,
      true
    );
  }

  private async applyEntityEffectsIfApplicable(npc: INPC, target: ICharacter | INPC): Promise<void> {
    const hasEntityEffects = npc?.entityEffects?.length! > 0;

    if (hasEntityEffects) {
      await this.entityEffectUse.applyEntityEffects(target, npc);
    }
  }

  @TrackNewRelicTransaction()
  private async applyEntityEffectsCharacter(
    character: ICharacter,
    weapon: ICharacterWeaponResult,
    target: ICharacter | INPC
  ): Promise<void> {
    // if we have a ranged weapon without entity effects, just use the accessory one
    if (weapon?.item.subType === ItemSubType.Ranged && !weapon.item.entityEffects?.length!) {
      // eslint-disable-next-line mongoose-lean/require-lean
      const equipment = await Equipment.findById(character.equipment).cacheQuery({
        cacheKey: `${character._id}-equipment`,
      });
      // eslint-disable-next-line mongoose-lean/require-lean
      const accessory = await Item.findById(equipment?.accessory);
      await this.applyEntity(target, character, accessory as IItem);
    } else {
      // otherwise, apply the weapon entity effect.
      await this.applyEntity(target, character, weapon?.item as IItem);
    }
  }

  @TrackNewRelicTransaction()
  private async applyEntity(target: ICharacter | INPC, character: ICharacter | INPC, item: IItem): Promise<void> {
    const hasEntityEffect = item?.entityEffects?.length! > 0;
    const entityEffectChance = item?.entityEffectChance;
    if (hasEntityEffect && entityEffectChance) {
      const n = random(0, 100);

      if (entityEffectChance <= n) {
        return;
      }

      await this.entityEffectUse.applyEntityEffects(target, character);
    }
  }

  @TrackNewRelicTransaction()
  private async warnCharacterIfNotInView(character: ICharacter, target: ICharacter | INPC): Promise<void> {
    switch (target.type) {
      case EntityType.NPC:
        const isNPCInView = this.characterView.isOnCharacterView(character._id, target._id, "npcs");

        if (!isNPCInView) {
          await this.npcWarn.warnCharacterAboutSingleNPCCreation(target as INPC, character);
        }
        break;
      case EntityType.Character:
        const isCharacterOnCharView = this.characterView.isOnCharacterView(character._id, target._id, "characters");

        if (!isCharacterOnCharView) {
          await this.characterMovementWarn.warnAboutSingleCharacter(character, target as ICharacter);
        }

        break;
    }
  }

  private getPower = (item: IItem): number => {
    const attack = item?.attack ?? 0;
    const basePower = 15;

    if (attack < basePower) {
      return basePower;
    } else {
      return attack;
    }
  };
}
