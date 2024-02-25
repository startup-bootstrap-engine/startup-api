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

export const npcFireNaga: INPCTierBlueprint<24> = {
  ...generateMoveTowardsMovement(),
  name: "Fire Naga",
  key: HostileNPCsBlueprint.FireNaga,
  textureKey: HostileNPCsBlueprint.FireNaga,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Standard,
  tier: 24,
  subType: NPCSubtype.Humanoid,
  baseHealth: 6770,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  isMagic: true,
  skills: {
    level: 618,
    strength: {
      level: 618,
    },
    dexterity: {
      level: 618,
    },
    resistance: {
      level: 618,
    },
    magicResistance: {
      level: 618,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: 27,
    },
    {
      itemBlueprintKey: SwordsBlueprint.InfernoCleaver,
      chance: 7,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonHead,
      chance: 118,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonTooth,
      chance: 112,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilJianSword,
      chance: 8,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 34,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: 34,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: 34,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.TemplarsPlate,
      chance: 24,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: 32,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 32,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: 26,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: 24,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 42,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 42,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: 12,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: 12,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 44,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: 18,
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilTemplarSword,
      chance: 20,
    },
    {
      itemBlueprintKey: MacesBlueprint.SunderingClub,
      chance: 60,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 88,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 64,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 92,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: 52,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: 68,
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: 78,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: 78,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: 52,
    },
    {
      itemBlueprintKey: AxesBlueprint.WarAxe,
      chance: 62,
    },
    {
      itemBlueprintKey: AxesBlueprint.DanishAxe,
      chance: 72,
    },
    {
      itemBlueprintKey: AxesBlueprint.SpikedCleaverAxe,
      chance: 74,
    },
    {
      itemBlueprintKey: AxesBlueprint.TimberSplitterAxe,
      chance: 81,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 86,
    },
    {
      itemBlueprintKey: AxesBlueprint.BrutalChopperAxe,
      chance: 91,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 52,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 98,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: 98,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: 102,
    },
    {
      itemBlueprintKey: GemsBlueprint.AmethystGem,
      chance: 10,
    },
    {
      itemBlueprintKey: GemsBlueprint.RubyGem,
      chance: 6,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EarthstoneEmeraldNecklace,
      chance: 12,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireStrandNecklace,
      chance: 26,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyNeckles,
      chance: 26,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenRubyNecklace,
      chance: 28,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SunlitRubyNecklace,
      chance: 28,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalCodex,
      chance: 12,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticCompendium,
      chance: 16,
    },
    {
      itemBlueprintKey: BooksBlueprint.SpellboundCodex,
      chance: 18,
    },
    {
      itemBlueprintKey: BooksBlueprint.PotioncraftPrimer,
      chance: 20,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.ArcaneAdepthat,
      chance: 22,
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
