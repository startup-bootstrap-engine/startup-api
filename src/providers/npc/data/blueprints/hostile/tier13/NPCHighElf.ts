import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  HelmetsBlueprint,
  OthersBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, RangeTypes } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcHighElf: INPCTierBlueprint<13> = {
  ...generateMoveTowardsMovement(),
  name: "High Elf",
  key: HostileNPCsBlueprint.HighElf,
  // @ts-ignore
  textureKey: "elf-white-hair-1",
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: RangedWeaponsBlueprint.Arrow,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Fast,
  baseHealth: 1020,
  tier: 13,
  healthRandomizerDice: Dice.D12,
  canSwitchToRandomTarget: true,
  skills: {
    level: 65,
    strength: {
      level: 65,
    },
    dexterity: {
      level: 65,
    },
    resistance: {
      level: 65,
    },
    magicResistance: {
      level: 65,
    },
    magic: {
      level: 65,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.Blueberry,
      chance: LootProbability.VeryCommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.PhoenixBow,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 2],
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
      itemBlueprintKey: OthersBlueprint.GoldCoin,
      chance: LootProbability.VeryCommon,
      quantityRange: [45, 75],
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: SwordsBlueprint.ElvenSword,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.TemplarSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.ElvenRing,
      chance: LootProbability.VeryRare,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: LootProbability.Uncommon,
      quantityRange: [3, 10],
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.ElvenWood,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.ElvenLeaf,
      chance: LootProbability.Uncommon,
      quantityRange: [5, 10],
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Herb,
      chance: LootProbability.SemiCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: BootsBlueprint.KnightBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.WoodBreakerAxe,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: ToolsBlueprint.EmeraldEclipsesPickaxe,
      chance: LootProbability.VeryRare,
    },
  ],
};
