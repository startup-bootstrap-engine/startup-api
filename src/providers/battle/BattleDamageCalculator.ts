import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterWeapon } from "@providers/character/CharacterWeapon";
import {
  BATTLE_CRITICAL_HIT_CHANCE,
  BATTLE_CRITICAL_HIT_DAMAGE_MULTIPLIER,
  BATTLE_PVP_MELEE_DAMAGE_RATIO,
  BATTLE_TOTAL_POTENTIAL_DAMAGE_MODIFIER,
  DAMAGE_REDUCTION_MAX_REDUCTION_PERCENTAGE,
  DAMAGE_REDUCTION_MIN_DAMAGE,
  DAMAGE_REDUCTION_MIN_LEVEL_FOR_NPC,
} from "@providers/constants/BattleConstants";
import { PVP_ROGUE_ATTACK_DAMAGE_INCREASE_MULTIPLIER } from "@providers/constants/PVPConstants";
import { LinearInterpolation } from "@providers/math/LinearInterpolation";
import { SkillStatsCalculator } from "@providers/skill/SkillsStatsCalculator";
import { TraitGetter } from "@providers/skill/TraitGetter";
import { BasicAttribute, CharacterClass, CombatSkill, EntityType, SKILLS_MAP } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";
import { BattleParticipant } from "./BattleEvent";

@provide(BattleDamageCalculator)
export class BattleDamageCalculator {
  constructor(
    private skillStatsCalculator: SkillStatsCalculator,
    private characterWeapon: CharacterWeapon,
    private traitGetter: TraitGetter,
    private linearInterpolation: LinearInterpolation
  ) {}

  @TrackNewRelicTransaction()
  public async calculateHitDamage(
    attacker: BattleParticipant,
    target: BattleParticipant,
    isMagicAttack: boolean = false
  ): Promise<number> {
    if (target.health <= 0 || attacker.health <= 0) {
      return 0;
    }

    const attackerSkills = await this.getOrFetchSkills(attacker);
    const defenderSkills = await this.getOrFetchSkills(target);

    const weapon = await this.characterWeapon.getWeapon(attacker as ICharacter);

    if (weapon?.item && weapon?.item.isTraining) {
      return Math.round(_.random(0, 1));
    }

    const totalPotentialAttackerDamage = isMagicAttack
      ? await this.calculateMagicTotalPotentialDamage(attackerSkills, defenderSkills)
      : await this.calculatePhysicalTotalPotentialDamage(attackerSkills, defenderSkills, weapon?.item);

    let adjustedDamage = this.adjustForClassAndPvP(attacker, target, totalPotentialAttackerDamage);
    adjustedDamage = this.calculateDamageWithDeviation(adjustedDamage);

    const reducedDamage = await this.implementDamageReduction(
      defenderSkills,
      target,
      adjustedDamage,
      isMagicAttack,
      weapon?.item
    );

    if (isNaN(reducedDamage)) {
      console.error("calculateHitDamage returned NaN. Inputs:", {
        attacker: attacker._id,
        target: target._id,
        isMagicAttack,
        totalPotentialAttackerDamage,
        adjustedDamage,
        reducedDamage,
      });
      return 0; // Return a default value instead of NaN
    }

    return Math.max(0, Math.min(reducedDamage, target.health));
  }

  public getCriticalHitDamageIfSucceed(damage: number): number {
    const hasCriticalHitSucceeded = _.random(0, 100) <= BATTLE_CRITICAL_HIT_CHANCE;
    return hasCriticalHitSucceeded ? damage * BATTLE_CRITICAL_HIT_DAMAGE_MULTIPLIER : damage;
  }

  private async getOrFetchSkills(participant: BattleParticipant): Promise<ISkill> {
    try {
      let skills = participant.skills as unknown as ISkill;
      if (!skills?.level) {
        skills = (await this.getSkills(participant._id)) as unknown as ISkill;
      }
      if (!skills) {
        throw new Error(`Skills not found for participant ${participant._id}`);
      }
      return skills;
    } catch (error) {
      console.error("Failed to fetch skills:", error);
      throw error;
    }
  }

  private async getSkills(entityId: string): Promise<ISkill> {
    const skills = (await Skill.findOne({
      owner: entityId,
    })
      .lean({ virtuals: true, defaults: true })
      .cacheQuery({
        cacheKey: `${entityId}-skills`,
      })) as unknown as ISkill;
    return skills;
  }

  private calculateDamageWithDeviation(totalPotentialDamage: number): number {
    const meanDamage = totalPotentialDamage * 0.75; // 75% of max as the mean
    const stdDeviation = totalPotentialDamage * 0.1; // 10% of max as the std deviation
    return Math.round(this.gaussianRandom(meanDamage, stdDeviation));
  }

  private gaussianRandom(mean: number, stdDeviation: number): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return num * stdDeviation + mean;
  }

  private async implementDamageReduction(
    defenderSkills: ISkill,
    target: ICharacter | INPC,
    damage: number,
    isMagicAttack: boolean,
    weapon: IItem | undefined
  ): Promise<number> {
    switch (target.type) {
      case EntityType.Character:
        return await this.handleCharacterDamageReduction(defenderSkills, target as ICharacter, damage, isMagicAttack);
      case EntityType.NPC:
        return this.handleNPCDamageReduction(defenderSkills, damage, isMagicAttack, weapon);
      default:
        return damage;
    }
  }

  private async handleCharacterDamageReduction(
    defenderSkills: ISkill,
    character: ICharacter,
    damage: number,
    isMagicAttack: boolean
  ): Promise<number> {
    if (!defenderSkills.owner) {
      defenderSkills.owner = character._id;
    }

    const [hasShield, defenderShieldingLevel, defenderResistanceLevel, defenderMagicResistanceLevel] =
      await Promise.all([
        this.characterWeapon.hasShield(character),
        this.traitGetter.getSkillLevelWithBuffs(defenderSkills, CombatSkill.Shielding),
        this.traitGetter.getSkillLevelWithBuffs(defenderSkills, BasicAttribute.Resistance),
        this.traitGetter.getSkillLevelWithBuffs(defenderSkills, BasicAttribute.MagicResistance),
      ]);

    const level = defenderSkills.level * this.getDefenderLevelModifier(character.class as CharacterClass);

    if (hasShield && defenderShieldingLevel > 1) {
      return this.calculateDamageReduction(
        damage,
        this.calculateCharacterShieldingDefense(level, defenderResistanceLevel, defenderShieldingLevel)
      );
    } else {
      const defenseAttribute = isMagicAttack ? defenderMagicResistanceLevel : defenderResistanceLevel;
      return this.calculateDamageReduction(damage, this.calculateRegularDefense(level, defenseAttribute));
    }
  }

  private handleNPCDamageReduction(
    defenderSkills: ISkill,
    damage: number,
    isMagicAttack: boolean,
    weapon: IItem | undefined
  ): number {
    // Skip damage reduction if the attacker is using a training weapon
    if (weapon?.isTraining) {
      return damage;
    }

    if (defenderSkills.level >= DAMAGE_REDUCTION_MIN_LEVEL_FOR_NPC) {
      const npcDefenseReductionRatio =
        this.linearInterpolation.calculateLinearInterpolation(
          defenderSkills.level,
          5,
          DAMAGE_REDUCTION_MAX_REDUCTION_PERCENTAGE * 100
        ) / 100;

      // Access the .level property of the specific attribute
      const defenseAttributeLevel = isMagicAttack
        ? defenderSkills.magicResistance.level
        : defenderSkills.resistance.level;

      const result =
        this.calculateDamageReduction(damage, defenderSkills.level + defenseAttributeLevel) * npcDefenseReductionRatio;

      return result;
    }

    return damage;
  }

  private getDefenderLevelModifier(characterClass: CharacterClass): number {
    switch (characterClass) {
      case CharacterClass.Druid:
      case CharacterClass.Sorcerer:
        return 0.25;
      case CharacterClass.Hunter:
        return 0.75;
      default:
        return 1;
    }
  }

  private async calculateMagicTotalPotentialDamage(attackerSkills: ISkill, defenderSkills: ISkill): Promise<number> {
    if (!attackerSkills || !defenderSkills) {
      throw new Error("Invalid skills data");
    }

    const [attackerTotalAttack, defenderTotalDefense] = await Promise.all([
      this.skillStatsCalculator.getMagicAttack(attackerSkills),
      this.skillStatsCalculator.getMagicDefense(defenderSkills),
    ]);

    return _.round(attackerTotalAttack * (100 / (100 + defenderTotalDefense))) * BATTLE_TOTAL_POTENTIAL_DAMAGE_MODIFIER;
  }

  private async calculatePhysicalTotalPotentialDamage(
    attackerSkills: ISkill,
    defenderSkills: ISkill,
    weapon: IItem | undefined
  ): Promise<number> {
    const extraDamage = this.calculateExtraDamageBasedOnSkills(weapon, attackerSkills);
    const [attackerTotalAttack, defenderTotalDefense] = await Promise.all([
      this.skillStatsCalculator.getAttack(attackerSkills),
      this.skillStatsCalculator.getDefense(defenderSkills),
    ]);

    return (
      _.round((attackerTotalAttack + extraDamage) * (100 / (100 + defenderTotalDefense))) *
      BATTLE_TOTAL_POTENTIAL_DAMAGE_MODIFIER
    );
  }

  private adjustForClassAndPvP(
    attacker: BattleParticipant,
    target: BattleParticipant,
    totalPotentialDamage: number
  ): number {
    if (attacker.type === EntityType.Character && target.type === EntityType.Character) {
      totalPotentialDamage += this.calculateExtraDamageBasedOnClass(
        attacker.class as CharacterClass,
        totalPotentialDamage
      );
      return totalPotentialDamage * BATTLE_PVP_MELEE_DAMAGE_RATIO;
    }
    return totalPotentialDamage;
  }

  private calculateCharacterShieldingDefense(level: number, resistanceLevel: number, shieldingLevel: number): number {
    return this.calculateRegularDefense(level, resistanceLevel) + Math.floor(shieldingLevel / 2);
  }

  private calculateRegularDefense(level: number, resistanceLevel: number): number {
    return resistanceLevel + level;
  }

  private calculateDamageReduction(damage: number, defense: number): number {
    const reduction = Math.min(defense / 100, DAMAGE_REDUCTION_MAX_REDUCTION_PERCENTAGE);
    return Math.max(DAMAGE_REDUCTION_MIN_DAMAGE, damage * (1 - reduction));
  }

  private calculateExtraDamageBasedOnSkills(weapon: IItem | undefined, characterSkills: ISkill): number {
    const weaponSubType = weapon ? weapon.subType || "None" : "None";
    const skillName = SKILLS_MAP.get(weaponSubType);
    return skillName ? Math.floor(characterSkills[skillName]?.level / 2) : 0;
  }

  private calculateExtraDamageBasedOnClass(clas: CharacterClass, calculatedDamage: number): number {
    return clas === CharacterClass.Rogue
      ? Math.floor(calculatedDamage * PVP_ROGUE_ATTACK_DAMAGE_INCREASE_MULTIPLIER)
      : 0;
  }
}
