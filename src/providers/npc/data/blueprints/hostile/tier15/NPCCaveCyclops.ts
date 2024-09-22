import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  AxesBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcCaveCyclops: INPCTierBlueprint<15> = {
  ...generateMoveTowardsMovement(),
  name: "Cave Cyclops",
  key: HostileNPCsBlueprint.CaveCyclops,
  textureKey: HostileNPCsBlueprint.CaveCyclops,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Slow,
  baseHealth: 1420,
  tier: 15,
  subType: NPCSubtype.Humanoid,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
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
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: AxesBlueprint.GoldenAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.TurnipSeed,
      chance: LootProbability.Common,
      quantityRange: [1, 8],
    },
    {
      itemBlueprintKey: DaggersBlueprint.PhoenixDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.HellishBow,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.ObsidiumOre,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireRing,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.IronWoodCrusherClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: SwordsBlueprint.Shadowblade,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.EmeraldEclipsesPickaxe,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.JadeEmperorsHelm,
      chance: LootProbability.Uncommon,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CleavingStomp,
      probability: 50,
      power: MagicPower.High,
    },
  ],
};
