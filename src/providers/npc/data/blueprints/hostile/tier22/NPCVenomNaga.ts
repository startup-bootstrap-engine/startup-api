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

export const npcVenomNaga: INPCTierBlueprint<21> = {
  ...generateMoveTowardsMovement(),
  name: "Venom Naga",
  key: HostileNPCsBlueprint.VenomNaga,
  textureKey: HostileNPCsBlueprint.VenomNaga,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Standard,
  tier: 21,
  subType: NPCSubtype.Humanoid,
  baseHealth: 4170,
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
    magic: {
      level: 358,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: 36,
    },
    {
      itemBlueprintKey: SwordsBlueprint.InfernoCleaver,
      chance: 14,
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilJianSword,
      chance: 16,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 42,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: 42,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: 42,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.TemplarsPlate,
      chance: 32,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: 40,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 40,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: 36,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: 36,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 54,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 52,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: 20,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: 20,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: 20,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 52,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: 26,
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilTemplarSword,
      chance: 30,
    },
    {
      itemBlueprintKey: MacesBlueprint.SunderingClub,
      chance: 72,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 96,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 74,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 100,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: 65,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: 78,
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: 86,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: 88,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: 62,
    },
    {
      itemBlueprintKey: AxesBlueprint.WarAxe,
      chance: 72,
    },
    {
      itemBlueprintKey: AxesBlueprint.DanishAxe,
      chance: 80,
    },
    {
      itemBlueprintKey: AxesBlueprint.SpikedCleaverAxe,
      chance: 82,
    },
    {
      itemBlueprintKey: AxesBlueprint.TimberSplitterAxe,
      chance: 90,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 95,
    },
    {
      itemBlueprintKey: AxesBlueprint.BrutalChopperAxe,
      chance: 100,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 65,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 108,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: 110,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: 110,
    },
    {
      itemBlueprintKey: GemsBlueprint.AmethystGem,
      chance: 18,
    },
    {
      itemBlueprintKey: GemsBlueprint.RubyGem,
      chance: 16,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EarthstoneEmeraldNecklace,
      chance: 20,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireStrandNecklace,
      chance: 34,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyNeckles,
      chance: 38,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenRubyNecklace,
      chance: 36,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SunlitRubyNecklace,
      chance: 35,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalCodex,
      chance: 18,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticCompendium,
      chance: 24,
    },
    {
      itemBlueprintKey: BooksBlueprint.SpellboundCodex,
      chance: 28,
    },
    {
      itemBlueprintKey: BooksBlueprint.PotioncraftPrimer,
      chance: 28,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.ArcaneAdepthat,
      chance: 32,
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
