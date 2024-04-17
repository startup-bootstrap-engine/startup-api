import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  DaggersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcCyclops: INPCTierBlueprint<14> = {
  ...generateMoveTowardsMovement(),
  name: "Cyclops",
  key: HostileNPCsBlueprint.Cyclops,
  textureKey: HostileNPCsBlueprint.Cyclops,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Slow,
  baseHealth: 1220,
  tier: 14,
  subType: NPCSubtype.Humanoid,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 77,
    strength: {
      level: 77,
    },
    dexterity: {
      level: 77,
    },
    resistance: {
      level: 77,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: MacesBlueprint.HellishKingMace,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.CrownHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.TurnipSeed,
      chance: LootProbability.Common,
      quantityRange: [1, 7],
    },
    {
      itemBlueprintKey: ShieldsBlueprint.FalconsShield,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: SwordsBlueprint.EnchantedSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.VerdantDagger,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.PlatinumTintLegs,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.StarfirMaulClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.ElderHeartAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.EmberEdgePickaxe,
      chance: LootProbability.SemiCommon,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
};
