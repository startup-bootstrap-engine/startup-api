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
  HammersBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  SpearsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { SpellAreaProbability } from "@providers/spells/area-spells/NPCSpellAreaTypes";
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
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: StaffsBlueprint.GhostFireStaff,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.PhoenixDagger,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BooksBlueprint.SoulCrystal,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.GildedLavaPickaxe,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HammersBlueprint.SilverHammer,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RustedDoubleVoulge,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalStoneScepter,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.IronWoodCrusherClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ArrowheadDagger,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: GemsBlueprint.CoralReefGem,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: AccessoriesBlueprint.WoodlandNecklace,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GreenTourmalineRing,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.SpellboundCodex,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.AstralAtlas,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.DruidicLoreVolume,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.MysticVeilHat,
      chance: LootProbability.Rare,
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
    {
      spellKey: SpellsBlueprint.SelfHealingSpell,
      probability: SpellAreaProbability.Uncommon,
      power: MagicPower.High,
    },
  ],
};
