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
  EntityType,
  IBattleEventFromServer,
  ItemSubType,
} from "@rpg-engine/shared";

import { appEnv } from "@providers/config/env";
import { BONUS_DAMAGE_MULTIPLIER } from "@providers/constants/BattleConstants";
import { RedisManager } from "@providers/database/RedisManager";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Queue, Worker } from "bullmq";
import random from "lodash/random";
import { BattleAttackTargetDeath } from "./BattleAttackTarget/BattleAttackTargetDeath";
import { BattleDamageCalculator } from "./BattleDamageCalculator";
import { BattleEffects } from "./BattleEffects";
import { BattleEvent } from "./BattleEvent";

@provideSingleton(HitTarget)
export class HitTarget {
  private npcQueue: Queue | null = null;
  private characterQueue: Queue | null = null;
  private worker: Worker | null = null;
  private connection: any;

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
    private redisManager: RedisManager
  ) {}

  public init(): void {
    if (appEnv.general.IS_UNIT_TEST) {
      return;
    }

    if (!this.connection) {
      this.connection = this.redisManager.client;
    }

    if (!this.npcQueue) {
      this.npcQueue = new Queue("npc-hit", {
        connection: this.connection,
      });

      if (!appEnv.general.IS_UNIT_TEST) {
        this.npcQueue.on("error", async (error) => {
          console.error("Error in the npcQueue:", error);

          await this.npcQueue?.close();
          this.npcQueue = null;
        });
      }
    }

    if (!this.characterQueue) {
      this.characterQueue = new Queue("character-hit", {
        connection: this.connection,
      });

      if (!appEnv.general.IS_UNIT_TEST) {
        this.characterQueue.on("error", async (error) => {
          console.error("Error in the characterQueue:", error);

          await this.characterQueue?.close();
          this.characterQueue = null;
        });
      }
    }

    if (!this.worker) {
      this.worker = new Worker(
        "character-hit",
        async (job) => {
          const { attacker, target, magicAttack, bonusDamage, spellHit } = job.data;

          await this.execHit(attacker, target, magicAttack, bonusDamage, spellHit);
        },
        {
          connection: this.connection,
        }
      );
      this.worker = new Worker(
        "npc-hit",
        async (job) => {
          try {
            const { attacker, target, magicAttack, bonusDamage, spellHit } = job.data;

            await this.execHit(attacker, target, magicAttack, bonusDamage, spellHit);
          } catch (error) {
            console.error(error);
          }
        },
        {
          connection: this.connection,
        }
      );

      if (!appEnv.general.IS_UNIT_TEST) {
        this.worker.on("failed", async (job, err) => {
          console.log(`HitTarget Job ${job?.id} failed with error ${err.message}`);
          // log details
          console.log(job);

          await this.worker?.close();
          this.worker = null;
        });
      }
    }
  }

  @TrackNewRelicTransaction()
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

    if (!this.npcQueue || !this.characterQueue || !this.worker || !this.connection) {
      this.init();
    }

    if (!attacker || !target) {
      return;
    }

    if (attacker.type === EntityType.Character) {
      await this.characterQueue?.add(
        "character-hit",
        { attacker, target, magicAttack, bonusDamage, spellHit },
        {
          removeOnComplete: true,
          removeOnFail: true,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 200,
          },
        }
      );
    } else {
      await this.npcQueue?.add(
        "npc-hit",
        { attacker, target, magicAttack, bonusDamage, spellHit },
        {
          removeOnComplete: true,
          removeOnFail: true,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 200,
          },
        }
      );
    }
  }

  public async shutdown(): Promise<void> {
    await this.npcQueue?.close();
    await this.characterQueue?.close();
    await this.worker?.close();
  }

  public async clearAllQueueJobs(): Promise<void> {
    try {
      if (!this.npcQueue || !this.characterQueue) {
        this.init();
      }

      const jobs = (await this.npcQueue?.getJobs(["waiting", "active", "delayed", "paused"])) ?? [];
      for (const job of jobs) {
        await job?.remove();
      }

      const jobs2 = (await this.characterQueue?.getJobs(["waiting", "active", "delayed", "paused"])) ?? [];
      for (const job of jobs2) {
        await job?.remove();
      }
    } catch (error) {
      console.error(error);
    }
  }

  @TrackNewRelicTransaction()
  public async execHit(
    attacker: ICharacter | INPC,
    target: ICharacter | INPC,
    magicAttack?: boolean,
    bonusDamage?: number,
    spellHit?: boolean
  ): Promise<void> {
    if (!target.isAlive) {
      return;
    }

    const battleEvent: BattleEventType = magicAttack
      ? BattleEventType.Hit
      : await this.battleEvent.calculateEvent(attacker, target);

    let battleEventPayload: Partial<IBattleEventFromServer> = {
      attackerId: attacker.id,
      attackerType: attacker.type as "Character" | "NPC",
      targetId: target.id,
      targetType: target.type as "Character" | "NPC",
      eventType: battleEvent,
    };

    if (battleEvent === BattleEventType.Hit) {
      let baseDamage = await this.battleDamageCalculator.calculateHitDamage(attacker, target, magicAttack);

      if (bonusDamage) {
        baseDamage += bonusDamage * BONUS_DAMAGE_MULTIPLIER;
      }

      let damage = this.battleDamageCalculator.getCriticalHitDamageIfSucceed(baseDamage);
      const maxDamage = target.health;
      damage = Math.min(damage, maxDamage);

      if (isNaN(damage)) {
        throw new Error("Damage is not a number");
      }

      const damageRelatedPromises: any[] = [];

      if (damage > 0) {
        if (attacker.type === "Character") {
          const character = attacker as ICharacter;
          await this.skillIncrease.increaseSkillsOnBattle(character, target, damage, spellHit);
        }

        if (attacker.class === CharacterClass.Berserker) {
          const character = attacker as ICharacter;
          const berserkerSpell = this.bloodthirst.getBerserkerBloodthirstSpell(character);

          if (await berserkerSpell) {
            damageRelatedPromises.push(this.bloodthirst.handleBerserkerAttack(character, damage));
          }
        }

        let sorcererManaShield: boolean = false;
        if (target.class === CharacterClass.Sorcerer || target.class === CharacterClass.Druid) {
          const character = target as ICharacter;
          const manaShieldSpell = this.manaShield.getManaShieldSpell(character);

          if (await manaShieldSpell) {
            sorcererManaShield = await this.manaShield.handleManaShield(character, damage);
          }
        }

        if (!sorcererManaShield) {
          const newTargetHealth = target.health - damage;

          if (newTargetHealth <= 0) {
            target.health = 0;
            target.isAlive = false;
          } else {
            target.health -= damage;
          }

          if (target.type === "Character") {
            damageRelatedPromises.push(
              Character.updateOne({ _id: target.id, scene: target.scene }, { health: target.health })
            );
          }
          if (target.type === "NPC") {
            damageRelatedPromises.push(
              NPC.updateOne(
                {
                  _id: target.id,
                  scene: target.scene,
                },
                { health: target.health }
              )
            );
          }
        }

        battleEventPayload = {
          ...battleEventPayload,
          totalDamage: damage,
          postDamageTargetHP: target.health,
          isCriticalHit: damage > baseDamage,
        };

        let weapon;
        if (target.type === "Character") {
          weapon = (await this.characterWeapon.getWeapon(attacker as ICharacter)) as unknown as ICharacterWeaponResult;

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

        if (target.isAlive) {
          if (attacker.type === EntityType.Character) {
            if (!weapon) {
              weapon = (await this.characterWeapon.getWeapon(
                attacker as ICharacter
              )) as unknown as ICharacterWeaponResult;
            }
            if (target.appliedEntityEffects?.length! === 0) {
              damageRelatedPromises.push(this.applyEntityEffectsCharacter(attacker as ICharacter, weapon, target));
            }
          } else if (attacker.type === EntityType.NPC) {
            damageRelatedPromises.push(this.applyEntityEffectsIfApplicable(attacker as INPC, target));
          }
        }

        const generateBloodChance = random(1, 100);

        generateBloodChance <= 10 && damageRelatedPromises.push(this.battleEffects.generateBloodOnGround(target));
      }

      await Promise.all(damageRelatedPromises);
    }

    const remainingPromises: any[] = [];

    if (battleEvent === BattleEventType.Block && target.type === "Character") {
      remainingPromises.push(this.skillIncrease.increaseShieldingSP(target as ICharacter));
    }

    if (battleEvent === BattleEventType.Miss && target.type === "Character") {
      remainingPromises.push(
        this.skillIncrease.increaseBasicAttributeSP(target as ICharacter, BasicAttribute.Dexterity)
      );
    }

    remainingPromises.push(this.warnCharacterIfNotInView(attacker as ICharacter, target));

    const character = attacker.type === "Character" ? (attacker as ICharacter) : (target as ICharacter);

    remainingPromises.push(this.sendBattleEvent(character, battleEventPayload as IBattleEventFromServer));
    remainingPromises.push(this.battleAttackTargetDeath.handleDeathAfterHit(attacker, target));

    await Promise.all(remainingPromises);
  }

  private async sendBattleEvent(character: ICharacter, battleEventPayload: IBattleEventFromServer): Promise<void> {
    const nearbyCharacters = await this.characterView.getCharactersInView(character);

    const channelIds = nearbyCharacters
      .filter((nearbyCharacter) => nearbyCharacter.channelId)
      .map((nearbyCharacter) => nearbyCharacter.channelId!);

    // If character.channelId is not in the list, add it.
    if (character.channelId && !channelIds.includes(character.channelId)) {
      channelIds.push(character.channelId);
    }

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
      const equipment = await Equipment.findById(character.equipment).cacheQuery({
        cacheKey: `${character._id}-equipment`,
      });
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
      case "NPC":
        const isNPCInView = this.characterView.isOnCharacterView(character._id, target._id, "npcs");

        if (!isNPCInView) {
          await this.npcWarn.warnCharacterAboutSingleNPCCreation(target as INPC, character);
        }
        break;
      case "Character":
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
