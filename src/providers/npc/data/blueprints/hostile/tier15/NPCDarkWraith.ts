import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  ArmorsBlueprint,
  BootsBlueprint,
  ContainersBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  GlovesBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  OthersBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";

import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { SpellAreaProbability } from "@providers/spells/area-spells/NPCSpellAreaTypes";
import { EntityAttackType, MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcDarkWraith: INPCTierBlueprint<15> = {
  ...generateMoveTowardsMovement(),
  name: "Dark Wraith",
  key: HostileNPCsBlueprint.DarkWraith,
  textureKey: HostileNPCsBlueprint.Wraith,
  alignment: NPCAlignment.Hostile,
  speed: MovementSpeed.Fast,
  baseHealth: 1320,
  tier: 15,
  subType: NPCSubtype.Undead,
  healthRandomizerDice: Dice.D12,
  canSwitchToRandomTarget: true,
  isMagic: true,
  attackType: EntityAttackType.MeleeRanged,
  skills: {
    level: 89,
    strength: {
      level: 89,
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
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: DaggersBlueprint.HellishDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.RuneCrossbow,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: OthersBlueprint.GoldCoin,
      chance: LootProbability.VeryCommon,
      quantityRange: [10, 50],
    },
    {
      itemBlueprintKey: StaffsBlueprint.MoonsStaff,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: ContainersBlueprint.Backpack,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.PlateShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PhoenixFeather,
      chance: LootProbability.SemiCommon,
      quantityRange: [5, 8],
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 6],
    },
    {
      itemBlueprintKey: HelmetsBlueprint.BerserkersHelmet,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: LootProbability.Rare,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Corruption],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CorruptionWave,
      probability: 5,
      power: MagicPower.UltraHigh,
    },
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 10,
      power: MagicPower.High,
    },
    {
      spellKey: SpellsBlueprint.SelfHealingSpell,
      probability: SpellAreaProbability.Rare,
      power: MagicPower.Low,
    },
  ],
};
