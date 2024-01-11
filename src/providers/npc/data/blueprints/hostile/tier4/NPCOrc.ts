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
  ShieldsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
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
      chance: 25,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.WaterBottle,
      quantityRange: [2, 4],
      chance: 25,
    },
    {
      itemBlueprintKey: BootsBlueprint.StuddedBoots,
      chance: 30,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueSapphire,
      chance: 10,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: 20,
    },
    {
      itemBlueprintKey: FoodsBlueprint.RedMushroom,
      chance: 10,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: FoodsBlueprint.RottenMeat,
      chance: 40,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: ToolsBlueprint.CarpentersAxe,
      chance: 20,
    },
    {
      itemBlueprintKey: OthersBlueprint.Candle,
      chance: 10,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.LeatherHelmet,
      chance: 30,
    },
    {
      itemBlueprintKey: LegsBlueprint.LeatherLegs,
      chance: 15,
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: 10,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.WoodenShield,
      chance: 5,
    },
    {
      itemBlueprintKey: HammersBlueprint.IronHammer,
      chance: 5,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.FarmersHelmet,
      chance: 20,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: 20,
      quantityRange: [3, 10],
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.OrcRing,
      chance: 30,
    },
    {
      itemBlueprintKey: StaffsBlueprint.Wand,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.Sword,
      chance: 15,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.ShortBow,
      chance: 5,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.FarmersJacket,
      chance: 20,
    },
    {
      itemBlueprintKey: BootsBlueprint.FarmersBoot,
      chance: 20,
    },

    {
      itemBlueprintKey: FoodsBlueprint.Milk,
      chance: 10,
    },
  ],
};
