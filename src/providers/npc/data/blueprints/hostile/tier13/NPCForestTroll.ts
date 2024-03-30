import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  PotionsBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";

export const npcForestTroll: INPCTierBlueprint<14> = {
  ...generateMoveTowardsMovement(),
  name: "Forest Troll",
  key: HostileNPCsBlueprint.ForestTroll,
  textureKey: HostileNPCsBlueprint.ForestTroll,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  baseHealth: 1220,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  tier: 14,
  subType: NPCSubtype.Humanoid,
  skills: {
    level: 80,
    strength: {
      level: 86,
    },
    dexterity: {
      level: 86,
    },
    resistance: {
      level: 83,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DoubleEdgedSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.EggplantSeed,
      chance: LootProbability.Common,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: LegsBlueprint.BronzeLegs,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: GlovesBlueprint.StuddedGloves,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: PotionsBlueprint.LightLifePotion,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.HuntersBow,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.InfantryHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.WildSalmon,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: BootsBlueprint.PlateBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.KnightsShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HammersBlueprint.RoyalHammer,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.FireSword,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.ElvenBolt,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.Kunai,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WoodenSticks,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.SmallWoodenStick,
      chance: LootProbability.Common,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.AurumAlloyPickaxe,
      chance: LootProbability.Rare,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.NaturesRevenge,
      probability: 25,
      power: MagicPower.Medium,
    },
  ],
};
