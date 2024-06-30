import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AxesBlueprint,
  BootsBlueprint,
  ContainersBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  GlovesBlueprint,
  LegsBlueprint,
  OthersBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { SpellAreaProbability } from "@providers/spells/area-spells/NPCSpellAreaTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcWraith: INPCTierBlueprint<12> = {
  ...generateMoveTowardsMovement(),
  name: "Wraith",
  key: HostileNPCsBlueprint.Wraith,
  tier: 12,
  subType: NPCSubtype.Undead,
  textureKey: HostileNPCsBlueprint.Wraith,
  alignment: NPCAlignment.Hostile,
  speed: MovementSpeed.Fast,
  baseHealth: 820,
  attackType: EntityAttackType.Melee,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  isMagic: true,
  skills: {
    level: 62,
    strength: {
      level: 62,
    },
    dexterity: {
      level: 62,
    },
    resistance: {
      level: 62,
    },
    magicResistance: {
      level: 62,
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
      itemBlueprintKey: StaffsBlueprint.SerpentWand,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.WindCutterSword,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: AxesBlueprint.SerpentDanceAxe,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: GlovesBlueprint.GleamingGauntlets,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.LogSplitterAxe,
      chance: LootProbability.Rare,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Corruption],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CorruptionWave,
      probability: 50,
      power: MagicPower.High,
    },
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 10,
      power: MagicPower.Medium,
    },
    {
      spellKey: SpellsBlueprint.SelfHealingSpell,
      probability: SpellAreaProbability.Rare,
      power: MagicPower.Low,
    },
  ],
};
