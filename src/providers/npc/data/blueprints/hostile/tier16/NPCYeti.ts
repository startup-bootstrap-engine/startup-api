import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
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
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCCustomDeathPenalties, NPCSubtype, RangeTypes } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcYeti: INPCTierBlueprint<16> = {
  ...generateMoveTowardsMovement(),
  name: "Yeti",
  tier: 16,
  subType: NPCSubtype.Humanoid,
  key: HostileNPCsBlueprint.Yeti,
  textureKey: HostileNPCsBlueprint.Yeti,
  alignment: NPCAlignment.Hostile,
  speed: MovementSpeed.Fast,
  baseHealth: 1670,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: RangedWeaponsBlueprint.Stone,
  maxRangeAttack: RangeTypes.High,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,

  skills: {
    level: 128,
    strength: {
      level: 128,
    },
    dexterity: {
      level: 128,
    },
    resistance: {
      level: 128,
    },
    magicResistance: {
      level: 128,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: 20,
    },

    {
      itemBlueprintKey: ShieldsBlueprint.TowerShield,
      chance: 5,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: 30,
    },
    {
      itemBlueprintKey: StaffsBlueprint.SkyBlueStaff,
      chance: 5,
    },
    {
      itemBlueprintKey: StaffsBlueprint.TartarusStaff,
      chance: 1,
    },

    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: 80,
    },

    {
      itemBlueprintKey: StaffsBlueprint.MoonsStaff,
      chance: 30,
    },
    {
      itemBlueprintKey: AxesBlueprint.RoyalDoubleAxe,
      chance: 10,
    },
    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: 20,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: 30,
    },
    {
      itemBlueprintKey: HammersBlueprint.WarHammer,
      chance: 20,
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
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: 60,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.BronzeArmor,
      chance: 10,
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
      itemBlueprintKey: HelmetsBlueprint.GlacialCrown,
      chance: 5,
    },
    {
      itemBlueprintKey: AxesBlueprint.GlacialAxe,
      chance: 5,
    },
    {
      itemBlueprintKey: LegsBlueprint.GlacialLegs,
      chance: 5,
    },
    {
      itemBlueprintKey: SwordsBlueprint.GlacialSword,
      chance: 5,
    },
    {
      itemBlueprintKey: AxesBlueprint.Axe,
      chance: 30,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GlacialRing,
      chance: 5,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Rock,
      chance: 20,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Jade,
      chance: 10,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.SeekerArrow,
      chance: 2,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: GlovesBlueprint.FrostwardenGloves,
      chance: 1,
    },
    {
      itemBlueprintKey: AxesBlueprint.MaulAxe,
      chance: 22,
    },
    {
      itemBlueprintKey: AxesBlueprint.TwinEdgeAxe,
      chance: 25,
    },
    {
      itemBlueprintKey: AxesBlueprint.DanishAxe,
      chance: 30,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Freezing],
};
