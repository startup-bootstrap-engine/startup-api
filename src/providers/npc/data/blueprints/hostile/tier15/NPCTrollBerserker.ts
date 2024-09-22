import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import {
  MagicPower,
  NPCAlignment,
  NPCCustomDeathPenalties,
  NPCSubtype,
  RangeTypes,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  AxesBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MagicsBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { SpellAreaProbability } from "@providers/spells/area-spells/NPCSpellAreaTypes";

export const npcTrollBerserker: INPCTierBlueprint<15> = {
  ...generateMoveTowardsMovement(),
  name: "Troll Berserker",
  key: HostileNPCsBlueprint.TrollBerserker,
  tier: 15,
  subType: NPCSubtype.Humanoid,
  textureKey: HostileNPCsBlueprint.TrollBerserker,
  alignment: NPCAlignment.Hostile,
  speed: MovementSpeed.Standard,
  isGiantForm: true,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: RangedWeaponsBlueprint.Stone,
  maxRangeAttack: RangeTypes.High,
  baseHealth: 1470,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,

  skills: {
    level: 92,
    strength: {
      level: 98,
    },
    dexterity: {
      level: 89,
    },
    resistance: {
      level: 89,
    },
    magicResistance: {
      level: 89,
    },
  },
  loots: [
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.PotatoSeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: ShieldsBlueprint.PaviseShield,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.TowerShield,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: LegsBlueprint.BronzeLegs,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.PlateShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.SoldiersHelmet,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.DoubleAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HammersBlueprint.WarHammer,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: AxesBlueprint.RoyalDoubleAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bolt,
      chance: LootProbability.VeryCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.RoyalCrossbow,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bow,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: FoodsBlueprint.Salmon,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.GreaterWoodenLog,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: SwordsBlueprint.Rapier,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MagicsBlueprint.FireRune,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PhoenixFeather,
      chance: LootProbability.Rare,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: SwordsBlueprint.AngelicSword,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: GlovesBlueprint.OraclegripGloves,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.JadeRing,
      chance: LootProbability.Rare,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CleavingStomp,
      probability: 20,
      power: MagicPower.Medium,
    },
    {
      spellKey: SpellsBlueprint.SelfHealingSpell,
      probability: SpellAreaProbability.Rare,
      power: MagicPower.Low,
    },
  ],
};
