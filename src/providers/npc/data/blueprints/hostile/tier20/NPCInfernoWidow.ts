import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import {
  AnimationEffectKeys,
  MagicPower,
  NPCAlignment,
  NPCCustomDeathPenalties,
  NPCSubtype,
  RangeTypes,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcInfernoWidow: INPCTierBlueprint<20> = {
  ...generateMoveTowardsMovement(),
  name: "Inferno Widow",
  key: HostileNPCsBlueprint.InfernoWidow,
  subType: NPCSubtype.Insect,
  textureKey: HostileNPCsBlueprint.GiantSpider,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  speed: MovementSpeed.Standard,
  ammoKey: AnimationEffectKeys.Green,
  maxRangeAttack: RangeTypes.High,
  // @ts-ignore
  baseHealth: 10000,
  tier: 20,
  isGiantForm: true,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  skills: {
    level: 298,
    strength: {
      level: 298,
    },
    dexterity: {
      level: 298,
    },
    resistance: {
      level: 298,
    },
    magicResistance: {
      level: 298,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: ToolsBlueprint.GildedLavaPickaxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: StaffsBlueprint.ProphecyStaff,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PrimordialRelic,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.TemplarsPlate,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: ArmorsBlueprint.TemplarsPlate,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AxesBlueprint.BloodmoonCleaver,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HammersBlueprint.InfernoHammer,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: LootProbability.Uncommon,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.NaturesRevenge,
      probability: 10,
      power: MagicPower.High,
    },
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 50,
      power: MagicPower.High,
    },
    {
      spellKey: SpellsBlueprint.FireStorm,
      probability: 90,
      power: MagicPower.Medium,
    },
  ],
};
