import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import {
  AnimationEffectKeys,
  MagicPower,
  NPCAlignment,
  NPCCustomDeathPenalties,
  NPCSubtype,
  RangeTypes,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcYellowDragon: INPCTierBlueprint<22> = {
  ...generateMoveTowardsMovement(),
  name: "Yellow Dragon",
  key: HostileNPCsBlueprint.YellowDragon,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.YellowDragon,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.FireBall,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,

  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.ExtraFast,
  // @ts-ignore
  baseHealth: 70000,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  canSwitchToRandomTarget: true,
  isMagic: true,
  tier: 22,
  skills: {
    level: 418,
    strength: {
      level: 418,
    },
    dexterity: {
      level: 418,
    },
    resistance: {
      level: 418,
    },
    magicResistance: {
      level: 418,
    },
    magic: {
      level: 418,
    },
  },
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: 20,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonHead,
      chance: 50,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonTooth,
      chance: 50,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: 5,
    },
    {
      itemBlueprintKey: MacesBlueprint.DragonScalCleaverClub,
      chance: 7,
    },
    {
      itemBlueprintKey: MacesBlueprint.ThunderStrikeClub,
      chance: 6,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 6,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: 7,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 3,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalStoneScepter,
      chance: 4,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 20,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: 20,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 20,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: 15,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: 10,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 30,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 30,
    },

    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: 5,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 30,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: 10,
    },
    {
      itemBlueprintKey: AxesBlueprint.BattleAxe,
      chance: 12,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: 10,
    },
    {
      itemBlueprintKey: AxesBlueprint.HammerCleaveAxe,
      chance: 10,
    },
    {
      itemBlueprintKey: AxesBlueprint.DualImpactAxe,
      chance: 15,
    },
    {
      itemBlueprintKey: AxesBlueprint.SpikeToppedAxe,
      chance: 20,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 40,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ArrowheadDagger,
      chance: 45,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: 45,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 45,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Burning],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.FireStorm,
      probability: 40,
      power: MagicPower.UltraHigh,
    },
    {
      spellKey: SpellsBlueprint.EnergyWave,
      probability: 70,
      power: MagicPower.UltraHigh,
    },
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 40,
      power: MagicPower.Medium,
    },
  ],
};
