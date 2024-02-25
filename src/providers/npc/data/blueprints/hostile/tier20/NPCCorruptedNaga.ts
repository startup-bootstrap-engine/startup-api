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

export const npcCorruptedNaga: INPCTierBlueprint<20> = {
  ...generateMoveTowardsMovement(),
  name: "Corrupted Naga",
  key: HostileNPCsBlueprint.CorruptedNaga,
  textureKey: HostileNPCsBlueprint.CorruptedNaga,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Standard,
  tier: 20,
  subType: NPCSubtype.Humanoid,
  baseHealth: 3270,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  isMagic: true,
  skills: {
    level: 268,
    strength: {
      level: 268,
    },
    dexterity: {
      level: 268,
    },
    resistance: {
      level: 268,
    },
    magicResistance: {
      level: 268,
    },
    magic: {
      level: 268,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: 23,
    },
    {
      itemBlueprintKey: SwordsBlueprint.InfernoCleaver,
      chance: 3,
    },

    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilJianSword,
      chance: 3,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 28,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: 28,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: 28,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.TemplarsPlate,
      chance: 18,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: 28,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 28,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: 22,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: 18,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 38,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 38,
    },

    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: 6,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: 8,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: 8,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 38,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: 14,
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilTemplarSword,
      chance: 16,
    },
    {
      itemBlueprintKey: MacesBlueprint.SunderingClub,
      chance: 55,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 83,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 58,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 87,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: 48,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: 63,
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: 74,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: 74,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: 48,
    },
    {
      itemBlueprintKey: AxesBlueprint.WarAxe,
      chance: 58,
    },
    {
      itemBlueprintKey: AxesBlueprint.DanishAxe,
      chance: 68,
    },
    {
      itemBlueprintKey: AxesBlueprint.SpikedCleaverAxe,
      chance: 70,
    },
    {
      itemBlueprintKey: AxesBlueprint.TimberSplitterAxe,
      chance: 77,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 82,
    },
    {
      itemBlueprintKey: AxesBlueprint.BrutalChopperAxe,
      chance: 87,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 48,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 94,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: 94,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: 98,
    },
    {
      itemBlueprintKey: GemsBlueprint.AmethystGem,
      chance: 6,
    },
    {
      itemBlueprintKey: GemsBlueprint.RubyGem,
      chance: 3,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EarthstoneEmeraldNecklace,
      chance: 8,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireStrandNecklace,
      chance: 22,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyNeckles,
      chance: 22,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenRubyNecklace,
      chance: 24,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SunlitRubyNecklace,
      chance: 24,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalCodex,
      chance: 9,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticCompendium,
      chance: 12,
    },
    {
      itemBlueprintKey: BooksBlueprint.SpellboundCodex,
      chance: 14,
    },
    {
      itemBlueprintKey: BooksBlueprint.PotioncraftPrimer,
      chance: 16,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.ArcaneAdepthat,
      chance: 18,
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
