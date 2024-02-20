import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  AxesBlueprint,
  BooksBlueprint,
  BootsBlueprint,
  DaggersBlueprint,
  GemsBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  SpearsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
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

export const npcNazgul: INPCTierBlueprint<18> = {
  ...generateMoveTowardsMovement(),
  name: "Nazgul",
  key: HostileNPCsBlueprint.Nazgul,
  subType: NPCSubtype.Undead,
  textureKey: HostileNPCsBlueprint.Nazgul,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  speed: MovementSpeed.Fast,
  ammoKey: AnimationEffectKeys.Dark,
  maxRangeAttack: RangeTypes.High,
  // @ts-ignore
  baseHealth: 6000,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  isMagic: true,
  skills: {
    level: 188,
    strength: {
      level: 188,
    },
    dexterity: {
      level: 188,
    },
    resistance: {
      level: 188,
    },
    magicResistance: {
      level: 188,
    },
  },
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: 5,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: 1,
    },
    {
      itemBlueprintKey: DaggersBlueprint.PhoenixDagger,
      chance: 10,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 5,
    },
    {
      itemBlueprintKey: HammersBlueprint.SilverHammer,
      chance: 5,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 2,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RustedDoubleVoulge,
      chance: 3,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 30,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 25,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalStoneScepter,
      chance: 30,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: 10,
    },
    {
      itemBlueprintKey: MacesBlueprint.IronWoodCrusherClub,
      chance: 20,
    },
    {
      itemBlueprintKey: AxesBlueprint.DualImpactAxe,
      chance: 22,
    },
    {
      itemBlueprintKey: AxesBlueprint.MaulAxe,
      chance: 24,
    },
    {
      itemBlueprintKey: AxesBlueprint.CrownSplitterAxe,
      chance: 26,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: 28,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: 30,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ArrowheadDagger,
      chance: 32,
    },
    {
      itemBlueprintKey: GemsBlueprint.CoralReefGem,
      chance: 1,
    },
    {
      itemBlueprintKey: SwordsBlueprint.FrostbiteSaber,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.FrostfangDagger,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.InfernoCleaver,
      chance: 10,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.WoodlandNecklace,
      chance: 2,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GreenTourmalineRing,
      chance: 8,
    },
    {
      itemBlueprintKey: BooksBlueprint.SpellboundCodex,
      chance: 4,
    },
    {
      itemBlueprintKey: BooksBlueprint.AstralAtlas,
      chance: 5,
    },
    {
      itemBlueprintKey: BooksBlueprint.DruidicLoreVolume,
      chance: 7,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.MysticVeilHat,
      chance: 8,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Corruption],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CorruptionWave,
      probability: 5,
      power: MagicPower.UltraHigh,
    },
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 10,
      power: MagicPower.High,
    },
  ],
};
