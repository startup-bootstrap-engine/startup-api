import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AxesBlueprint,
  BootsBlueprint,
  DaggersBlueprint,
  GemsBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { AnimationEffectKeys, MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcCorruptedCyclops: INPCTierBlueprint<18> = {
  ...generateMoveTowardsMovement(),
  name: "Corrupted Cyclops",
  key: HostileNPCsBlueprint.CorruptedCyclops,
  textureKey: HostileNPCsBlueprint.CorruptedCyclops,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.Dark,
  maxRangeAttack: 6,
  speed: MovementSpeed.Slow,
  baseHealth: 2470,
  tier: 18,
  subType: NPCSubtype.Humanoid,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 188,
    strength: {
      level: 188,
    },
    dexterity: {
      level: 188,
    },
    resistance: {
      level: 188,
    },
    magicResistance: {
      level: 188,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: DaggersBlueprint.RomanDagger,
      chance: 25,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.VikingHelmet,
      chance: 15,
    },
    {
      itemBlueprintKey: BootsBlueprint.SilverBoots,
      chance: 15,
    },
    {
      itemBlueprintKey: SwordsBlueprint.GlacialSword,
      chance: 15,
    },
    {
      itemBlueprintKey: DaggersBlueprint.RustedDagger,
      chance: 15,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 2,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 10,
    },
    {
      itemBlueprintKey: LegsBlueprint.PridelandsLegs,
      chance: 5,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 4,
    },
    {
      itemBlueprintKey: MacesBlueprint.StonefangCleaverClub,
      chance: 8,
    },
    {
      itemBlueprintKey: AxesBlueprint.DualImpactAxe,
      chance: 10,
    },
    {
      itemBlueprintKey: AxesBlueprint.BrutalChopperAxe,
      chance: 11,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: 28,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 30,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ArrowheadDagger,
      chance: 32,
    },
    {
      itemBlueprintKey: GemsBlueprint.EarthstoneGem,
      chance: 2,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Corruption],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CorruptionWave,
      probability: 5,
      power: MagicPower.Medium,
    },
  ],
};
