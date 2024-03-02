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
  GemsBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import {
  AnimationEffectKeys,
  MagicPower,
  NPCAlignment,
  NPCSubtype,
  RangeTypes,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcIceNaga: INPCTierBlueprint<21> = {
  ...generateMoveTowardsMovement(),
  name: "Ice Naga",
  key: HostileNPCsBlueprint.IceNaga,
  textureKey: HostileNPCsBlueprint.IceNaga,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Standard,
  tier: 21,
  subType: NPCSubtype.Humanoid,
  baseHealth: 4370,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  isMagic: true,
  skills: {
    level: 358,
    strength: {
      level: 358,
    },
    dexterity: {
      level: 358,
    },
    resistance: {
      level: 358,
    },
    magicResistance: {
      level: 358,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: 32,
    },
    {
      itemBlueprintKey: SwordsBlueprint.InfernoCleaver,
      chance: 10,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonHead,
      chance: 124,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonTooth,
      chance: 120,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilJianSword,
      chance: 12,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 38,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: 38,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: 38,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.TemplarsPlate,
      chance: 28,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: 36,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 36,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: 32,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: 32,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 50,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 46,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: 15,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: 17,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: 17,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 48,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: 22,
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilTemplarSword,
      chance: 26,
    },
    {
      itemBlueprintKey: MacesBlueprint.SunderingClub,
      chance: 68,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 92,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 70,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 96,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: 58,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: 72,
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: 82,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: 84,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: 58,
    },
    {
      itemBlueprintKey: AxesBlueprint.WarAxe,
      chance: 68,
    },
    {
      itemBlueprintKey: AxesBlueprint.DanishAxe,
      chance: 76,
    },
    {
      itemBlueprintKey: AxesBlueprint.SpikedCleaverAxe,
      chance: 78,
    },
    {
      itemBlueprintKey: AxesBlueprint.TimberSplitterAxe,
      chance: 85,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 90,
    },
    {
      itemBlueprintKey: AxesBlueprint.BrutalChopperAxe,
      chance: 95,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 56,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 103,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: 103,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: 106,
    },
    {
      itemBlueprintKey: GemsBlueprint.AmethystGem,
      chance: 14,
    },
    {
      itemBlueprintKey: GemsBlueprint.RubyGem,
      chance: 10,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EarthstoneEmeraldNecklace,
      chance: 16,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireStrandNecklace,
      chance: 30,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyNeckles,
      chance: 32,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenRubyNecklace,
      chance: 32,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SunlitRubyNecklace,
      chance: 32,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalCodex,
      chance: 14,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticCompendium,
      chance: 20,
    },
    {
      itemBlueprintKey: BooksBlueprint.SpellboundCodex,
      chance: 22,
    },
    {
      itemBlueprintKey: BooksBlueprint.PotioncraftPrimer,
      chance: 24,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.ArcaneAdepthat,
      chance: 28,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Burning, EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Corruption],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 50,
      power: MagicPower.High,
    },
    {
      spellKey: SpellsBlueprint.CorruptionWave,
      probability: 70,
      power: MagicPower.UltraHigh,
    },
    {
      spellKey: SpellsBlueprint.FireStorm,
      probability: 40,
      power: MagicPower.Medium,
    },
  ],
};
