import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  AxesBlueprint,
  BooksBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
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
  isGiantForm: true,
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
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: ShieldsBlueprint.TowerShield,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SeedsBlueprint.WatermelonSeed,
      chance: LootProbability.Common,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: StaffsBlueprint.SkyBlueStaff,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: StaffsBlueprint.TartarusStaff,
      chance: LootProbability.VeryRare,
    },

    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: LootProbability.VeryCommon,
    },

    {
      itemBlueprintKey: StaffsBlueprint.MoonsStaff,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.RoyalDoubleAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: HammersBlueprint.WarHammer,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.BronzeArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HammersBlueprint.WarHammer,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.InfantryHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.GlacialCrown,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AxesBlueprint.GlacialAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: LegsBlueprint.GlacialLegs,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.GlacialSword,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AxesBlueprint.Axe,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GlacialRing,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Rock,
      chance: LootProbability.Uncommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Jade,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.SeekerArrow,
      chance: LootProbability.VeryRare,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: GlovesBlueprint.FrostwardenGloves,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: AxesBlueprint.DanishAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.DarkmoonDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EarthstoneEmeraldNecklace,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireRing,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.EnchantedManuscript,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.DruidicLoreVolume,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.ArcaneAdepthat,
      chance: LootProbability.Rare,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Freezing],
};
