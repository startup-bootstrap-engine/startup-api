import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  SpearsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcMinotaurBerserker: INPCTierBlueprint<12> = {
  ...generateMoveTowardsMovement(),
  name: "Minotaur Berserker",
  subType: NPCSubtype.Humanoid,
  key: HostileNPCsBlueprint.MinotaurBerserker,
  textureKey: HostileNPCsBlueprint.MinotaurBerserker,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  tier: 12,
  canSwitchToLowHealthTarget: true,
  baseHealth: 720,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D8,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 53,
    strength: {
      level: 53,
    },
    dexterity: {
      level: 56,
    },
    resistance: {
      level: 56,
    },
    magicResistance: {
      level: 56,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: BootsBlueprint.RoyalBoots,
      chance: 3,
    },
    {
      itemBlueprintKey: SpearsBlueprint.GuanDao,
      chance: 10,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: 30,
    },
    {
      itemBlueprintKey: SwordsBlueprint.PoisonSword,
      chance: 20,
    },

    {
      itemBlueprintKey: DaggersBlueprint.CopperJitte,
      chance: 10,
    },
    {
      itemBlueprintKey: DaggersBlueprint.DamascusJitte,
      chance: 10,
    },

    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: 85,
    },
    {
      itemBlueprintKey: SpearsBlueprint.Trident,
      chance: 4,
    },
    {
      itemBlueprintKey: SwordsBlueprint.KnightsSword,
      chance: 5,
    },
    {
      itemBlueprintKey: HammersBlueprint.WarHammer,
      chance: 10,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.InfantryHelmet,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.BasiliskSword,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CopperBroadsword,
      chance: 10,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Jade,
      chance: 20,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: SwordsBlueprint.PixieCutSword,
      chance: 3,
    },
    {
      itemBlueprintKey: SwordsBlueprint.StellarBlade,
      chance: 2,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CleavingStomp,
      probability: 50,
      power: MagicPower.High,
    },
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 10,
      power: MagicPower.Medium,
    },
  ],
};
