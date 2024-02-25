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

export const npcForestNaga: INPCTierBlueprint<25> = {
  ...generateMoveTowardsMovement(),
  name: "Forest Naga",
  key: HostileNPCsBlueprint.ForestNaga,
  textureKey: HostileNPCsBlueprint.ForestNaga,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Standard,
  tier: 25,
  subType: NPCSubtype.Humanoid,
  baseHealth: 6970,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  isMagic: true,
  skills: {
    level: 638,
    strength: {
      level: 638,
    },
    dexterity: {
      level: 638,
    },
    resistance: {
      level: 638,
    },
    magicResistance: {
      level: 638,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: 29,
    },
    {
      itemBlueprintKey: SwordsBlueprint.InfernoCleaver,
      chance: 9,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonHead,
      chance: 120,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonTooth,
      chance: 116,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilJianSword,
      chance: 10,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 36,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: 36,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: 36,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.TemplarsPlate,
      chance: 26,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: 34,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 34,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: 30,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: 28,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 46,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 44,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: 13,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: 15,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: 15,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 46,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: 20,
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilTemplarSword,
      chance: 24,
    },
    {
      itemBlueprintKey: MacesBlueprint.SunderingClub,
      chance: 64,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 90,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 68,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 94,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: 56,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: 70,
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: 80,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: 82,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: 56,
    },
    {
      itemBlueprintKey: AxesBlueprint.WarAxe,
      chance: 64,
    },
    {
      itemBlueprintKey: AxesBlueprint.DanishAxe,
      chance: 74,
    },
    {
      itemBlueprintKey: AxesBlueprint.SpikedCleaverAxe,
      chance: 76,
    },
    {
      itemBlueprintKey: AxesBlueprint.TimberSplitterAxe,
      chance: 83,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 88,
    },
    {
      itemBlueprintKey: AxesBlueprint.BrutalChopperAxe,
      chance: 93,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 54,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 100,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: 100,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: 104,
    },
    {
      itemBlueprintKey: GemsBlueprint.AmethystGem,
      chance: 12,
    },
    {
      itemBlueprintKey: GemsBlueprint.RubyGem,
      chance: 8,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EarthstoneEmeraldNecklace,
      chance: 14,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireStrandNecklace,
      chance: 28,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyNeckles,
      chance: 28,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenRubyNecklace,
      chance: 30,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SunlitRubyNecklace,
      chance: 30,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalCodex,
      chance: 12,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticCompendium,
      chance: 18,
    },
    {
      itemBlueprintKey: BooksBlueprint.SpellboundCodex,
      chance: 20,
    },
    {
      itemBlueprintKey: BooksBlueprint.PotioncraftPrimer,
      chance: 22,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.ArcaneAdepthat,
      chance: 24,
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
