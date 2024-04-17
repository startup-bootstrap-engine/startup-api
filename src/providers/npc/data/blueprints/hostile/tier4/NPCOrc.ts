import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  OthersBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcOrc: INPCTierBlueprint<4> = {
  ...generateMoveTowardsMovement(),
  name: "Orc",
  subType: NPCSubtype.Humanoid,
  key: HostileNPCsBlueprint.Orc,
  textureKey: HostileNPCsBlueprint.Orc,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Slow,
  tier: 4,
  baseHealth: 200,
  healthRandomizerDice: Dice.D6,
  canSwitchToRandomTarget: true,
  skills: {
    level: 12,
    strength: {
      level: 11,
    },
    dexterity: {
      level: 11,
    },
    resistance: {
      level: 11,
    },
    magicResistance: {
      level: 11,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Wheat,
      quantityRange: [3, 5],
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.WaterBottle,
      quantityRange: [2, 4],
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: SeedsBlueprint.StrawberrySeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: BootsBlueprint.StuddedBoots,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueSapphire,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.RedMushroom,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: FoodsBlueprint.RottenMeat,
      chance: LootProbability.Common,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: ToolsBlueprint.CarpentersAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: OthersBlueprint.Candle,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.LeatherHelmet,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.LeatherLegs,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.WoodenShield,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HammersBlueprint.IronHammer,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.FarmersHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: LootProbability.Uncommon,
      quantityRange: [3, 10],
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.OrcRing,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: StaffsBlueprint.Wand,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.Sword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.ShortBow,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.FarmersJacket,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BootsBlueprint.FarmersBoot,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: FoodsBlueprint.Milk,
      chance: LootProbability.Uncommon,
    },
  ],
};
