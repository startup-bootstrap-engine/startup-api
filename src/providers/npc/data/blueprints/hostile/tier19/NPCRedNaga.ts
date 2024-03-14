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
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
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

export const npcRedNaga: INPCTierBlueprint<19> = {
  ...generateMoveTowardsMovement(),
  name: "Red Naga",
  key: HostileNPCsBlueprint.RedNaga,
  textureKey: HostileNPCsBlueprint.RedNaga,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Standard,
  tier: 19,
  subType: NPCSubtype.Humanoid,
  baseHealth: 3170,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  isMagic: true,
  skills: {
    level: 248,
    strength: {
      level: 248,
    },
    dexterity: {
      level: 248,
    },
    resistance: {
      level: 248,
    },
    magicResistance: {
      level: 248,
    },
    magic: {
      level: 248,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.InfernoCleaver,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.TemplarsPlate,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: LootProbability.Common,
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
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: MacesBlueprint.SunderingClub,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.WarAxe,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.DanishAxe,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.SpikedCleaverAxe,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.TimberSplitterAxe,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.BrutalChopperAxe,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: GemsBlueprint.AmethystGem,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: GemsBlueprint.RubyGem,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EarthstoneEmeraldNecklace,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireStrandNecklace,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyNeckles,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenRubyNecklace,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SunlitRubyNecklace,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalCodex,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticCompendium,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BooksBlueprint.SpellboundCodex,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BooksBlueprint.PotioncraftPrimer,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.ArcaneAdepthat,
      chance: LootProbability.SemiCommon,
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
