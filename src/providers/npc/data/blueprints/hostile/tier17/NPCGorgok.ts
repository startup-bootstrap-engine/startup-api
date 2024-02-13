import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  ContainersBlueprint,
  DaggersBlueprint,
  GlovesBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { generateMoveTowardsMovement } from "@providers/npc/data/abstractions/BaseNeutralNPC";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCCustomDeathPenalties, NPCSubtype, RangeTypes } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";

export const npcGorgok: INPCTierBlueprint<17> = {
  ...generateMoveTowardsMovement(),
  name: "Gorgok, the Chief",
  key: HostileNPCsBlueprint.Gorgok,
  tier: 17,
  subType: NPCSubtype.Humanoid,
  textureKey: HostileNPCsBlueprint.Goblin,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: RangedWeaponsBlueprint.IronArrow,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Fast,
  baseHealth: 2370,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,

  skills: {
    level: 178,
    strength: {
      level: 178,
    },
    dexterity: {
      level: 178,
    },
    resistance: {
      level: 178,
    },
    magicResistance: {
      level: 178,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: 1,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.TowerShield,
      chance: 20,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: 20,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LightingSword,
      chance: 20,
    },
    {
      itemBlueprintKey: SwordsBlueprint.PoisonSword,
      chance: 20,
    },
    {
      itemBlueprintKey: StaffsBlueprint.SangriaStaff,
      chance: 5,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 5,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 10,
    },
    {
      itemBlueprintKey: MacesBlueprint.HellishKingMace,
      chance: 10,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.IronArrow,
      chance: 25,
      quantityRange: [10, 20],
    },

    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: 30,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: 85,
    },
    {
      itemBlueprintKey: ContainersBlueprint.Backpack,
      chance: 50,
    },

    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: 20,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: 85,
    },
    {
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: 60,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.PlateShield,
      chance: 15,
    },
    {
      itemBlueprintKey: AxesBlueprint.GoldenAxe,
      chance: 1,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.GorgonGazeGuardianBow,
      chance: 1,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 30,
    },
    {
      itemBlueprintKey: AxesBlueprint.IroncladCleaver,
      chance: 40,
    },
    {
      itemBlueprintKey: AxesBlueprint.MaulAxe,
      chance: 39,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: 18,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 20,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: 22,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EmberStrandNecklace,
      chance: 2,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.FrostfireRubyRing,
      chance: 8,
    },
  ],
};
