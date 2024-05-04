import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  BooksBlueprint,
  BootsBlueprint,
  DaggersBlueprint,
  GemsBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCCustomDeathPenalties, RangeTypes } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcMalakarLichKing: INPCTierBlueprint<19> = {
  ...generateMoveTowardsMovement(),
  name: "Malakar, the Lich King",
  key: HostileNPCsBlueprint.MalakarLichKing,
  textureKey: HostileNPCsBlueprint.Litch,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  // @ts-ignore
  ammoKey: "fireball",
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.ExtraFast,
  // @ts-ignore
  baseHealth: 50000,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  skills: {
    level: 258,
    strength: {
      level: 258,
    },
    dexterity: {
      level: 258,
    },
    resistance: {
      level: 258,
    },
    magicResistance: {
      level: 258,
    },
    magic: {
      level: 258,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.BloodfireLegs,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: LootProbability.SemiCommon,
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
      itemBlueprintKey: ShieldsBlueprint.CrimsonAegisShield,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: StaffsBlueprint.SangriaStaff,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: StaffsBlueprint.TartarusStaff,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ArrowheadDagger,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: GemsBlueprint.CoralReefGem,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyNeckles,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EmberglowNecklace,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireSerenadeRing,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BooksBlueprint.EsotericEpistles,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.ArcaneArchives,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.AstralAtlas,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.MysticVeilHat,
      chance: LootProbability.Uncommon,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Burning, EntityEffectBlueprint.Corruption],
};
