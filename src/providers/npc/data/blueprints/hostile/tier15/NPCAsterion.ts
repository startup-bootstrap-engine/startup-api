import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  BootsBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  LegsBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { generateMoveTowardsMovement } from "@providers/npc/data/abstractions/BaseNeutralNPC";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";

import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { SpellAreaProbability } from "@providers/spells/area-spells/NPCSpellAreaTypes";
import { MagicPower, NPCAlignment, NPCCustomDeathPenalties, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";

export const npcAsterion: INPCTierBlueprint<15> = {
  ...generateMoveTowardsMovement(),
  name: "Asterion",
  key: HostileNPCsBlueprint.Asterion,
  textureKey: HostileNPCsBlueprint.MinotaurBerserker,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  isGiantForm: true,
  canSwitchToLowHealthTarget: true,
  // @ts-ignore
  baseHealth: 2500,
  healthRandomizerDice: Dice.D20,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,

  skills: {
    level: 95,
    strength: {
      level: 95,
    },
    dexterity: {
      level: 95,
    },
    resistance: {
      level: 95,
    },
    magicResistance: {
      level: 95,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: SwordsBlueprint.MinotaurSword,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.AsterionsBow,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.IronArrow,
      chance: LootProbability.Uncommon,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: ShieldsBlueprint.TowerShield,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: StaffsBlueprint.SkyBlueStaff,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: StaffsBlueprint.TartarusStaff,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: GlovesBlueprint.JadeclaspGloves,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenRing,
      chance: LootProbability.Rare,
    },
  ],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CleavingStomp,
      probability: 25,
      power: MagicPower.Medium,
    },

    {
      spellKey: SpellsBlueprint.SelfHealingSpell,
      probability: SpellAreaProbability.Rare,
      power: MagicPower.Low,
    },
  ],
};
