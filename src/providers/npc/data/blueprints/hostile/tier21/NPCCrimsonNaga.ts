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

export const npcCrimsonNaga: INPCTierBlueprint<21> = {
  ...generateMoveTowardsMovement(),
  name: "Crimson Naga",
  key: HostileNPCsBlueprint.CrimsonNaga,
  textureKey: HostileNPCsBlueprint.CrimsonNaga,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Standard,
  tier: 21,
  subType: NPCSubtype.Humanoid,
  baseHealth: 3770,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  isMagic: true,
  skills: {
    level: 318,
    strength: {
      level: 318,
    },
    dexterity: {
      level: 318,
    },
    resistance: {
      level: 318,
    },
    magicResistance: {
      level: 318,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: 25,
    },
    {
      itemBlueprintKey: SwordsBlueprint.InfernoCleaver,
      chance: 5,
    },

    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilJianSword,
      chance: 5,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 30,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: 30,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: 30,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.TemplarsPlate,
      chance: 20,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: 30,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 30,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: 24,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: 20,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 40,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 40,
    },

    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: 8,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: 10,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: 10,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 40,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: 16,
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilTemplarSword,
      chance: 18,
    },
    {
      itemBlueprintKey: MacesBlueprint.SunderingClub,
      chance: 57,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 85,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 60,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 89,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: 50,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: 65,
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: 76,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: 76,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: 50,
    },
    {
      itemBlueprintKey: AxesBlueprint.WarAxe,
      chance: 60,
    },
    {
      itemBlueprintKey: AxesBlueprint.DanishAxe,
      chance: 70,
    },
    {
      itemBlueprintKey: AxesBlueprint.SpikedCleaverAxe,
      chance: 72,
    },
    {
      itemBlueprintKey: AxesBlueprint.TimberSplitterAxe,
      chance: 79,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 84,
    },
    {
      itemBlueprintKey: AxesBlueprint.BrutalChopperAxe,
      chance: 89,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 50,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 96,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: 96,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: 100,
    },
    {
      itemBlueprintKey: GemsBlueprint.AmethystGem,
      chance: 8,
    },
    {
      itemBlueprintKey: GemsBlueprint.RubyGem,
      chance: 4,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EarthstoneEmeraldNecklace,
      chance: 10,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireStrandNecklace,
      chance: 24,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyNeckles,
      chance: 24,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenRubyNecklace,
      chance: 26,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SunlitRubyNecklace,
      chance: 26,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalCodex,
      chance: 10,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticCompendium,
      chance: 14,
    },
    {
      itemBlueprintKey: BooksBlueprint.SpellboundCodex,
      chance: 16,
    },
    {
      itemBlueprintKey: BooksBlueprint.PotioncraftPrimer,
      chance: 18,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.ArcaneAdepthat,
      chance: 20,
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
