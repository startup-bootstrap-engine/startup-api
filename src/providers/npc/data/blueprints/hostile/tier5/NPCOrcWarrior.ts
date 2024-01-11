import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcOrcWarrior: INPCTierBlueprint<5> = {
  ...generateMoveTowardsMovement(),
  name: "Orc Warrior",
  key: HostileNPCsBlueprint.OrcWarrior,
  subType: NPCSubtype.Humanoid,
  textureKey: HostileNPCsBlueprint.OrcWarrior,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  tier: 5,
  baseHealth: 250,
  healthRandomizerDice: Dice.D8,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  skills: {
    level: 17,
    strength: {
      level: 15,
    },
    dexterity: {
      level: 15,
    },
    resistance: {
      level: 17,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Wheat,
      quantityRange: [5, 7],
      chance: 25,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WaterBottle,
      quantityRange: [1, 2],
      chance: 25,
    },
    {
      itemBlueprintKey: BootsBlueprint.Boots,
      chance: 30,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueSapphire,
      chance: 30,
    },

    {
      itemBlueprintKey: ToolsBlueprint.ButchersKnife,
      chance: 15,
    },
    {
      itemBlueprintKey: AxesBlueprint.Axe,
      chance: 30,
    },
    {
      itemBlueprintKey: AxesBlueprint.Greataxe,
      chance: 5,
    },
    {
      itemBlueprintKey: SwordsBlueprint.BroadSword,
      chance: 15,
    },
    {
      itemBlueprintKey: HammersBlueprint.IronHammer,
      chance: 15,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.IronArmor,
      chance: 20,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.InfantryHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Milk,
      chance: 20,
    },
    {
      itemBlueprintKey: FoodsBlueprint.RottenMeat,
      chance: 40,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: HelmetsBlueprint.StuddedHelmet,
      chance: 15,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.StuddedArmor,
      chance: 15,
    },
    {
      itemBlueprintKey: AxesBlueprint.VikingAxe,
      chance: 10,
    },
    {
      itemBlueprintKey: BootsBlueprint.StuddedBoots,
      chance: 15,
    },
    {
      itemBlueprintKey: GlovesBlueprint.StuddedGloves,
      chance: 15,
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
      itemBlueprintKey: RangedWeaponsBlueprint.OrcishBow,
      chance: 20,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.IronArrow,
      chance: 20,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SoldiersRing,
      chance: 10,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueFeather,
      chance: 1,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WoodenSticks,
      chance: 10,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Rope,
      chance: 20,
    },
  ],
};
