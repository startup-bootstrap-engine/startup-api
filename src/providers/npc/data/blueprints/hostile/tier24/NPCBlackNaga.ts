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

export const npcBlackNaga: INPCTierBlueprint<24> = {
  ...generateMoveTowardsMovement(),
  name: "Black Naga",
  key: HostileNPCsBlueprint.BlackNaga,
  textureKey: HostileNPCsBlueprint.BlackNaga,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Standard,
  tier: 24,
  subType: NPCSubtype.Humanoid,
  baseHealth: 6170,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  isMagic: true,
  skills: {
    level: 558,
    strength: {
      level: 558,
    },
    dexterity: {
      level: 558,
    },
    resistance: {
      level: 558,
    },
    magicResistance: {
      level: 558,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: 22,
    },
    {
      itemBlueprintKey: SwordsBlueprint.InfernoCleaver,
      chance: 2,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonHead,
      chance: 110,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonTooth,
      chance: 104,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilJianSword,
      chance: 2,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 25,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: 25,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: 25,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.TemplarsPlate,
      chance: 14,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: 25,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 25,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: 18,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: 14,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 35,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 35,
    },

    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: 7,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: 7,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 35,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: 12,
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilTemplarSword,
      chance: 14,
    },
    {
      itemBlueprintKey: MacesBlueprint.SunderingClub,
      chance: 50,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 80,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 55,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 84,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: 45,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: 60,
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: 70,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: 70,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: 45,
    },
    {
      itemBlueprintKey: AxesBlueprint.WarAxe,
      chance: 55,
    },
    {
      itemBlueprintKey: AxesBlueprint.DanishAxe,
      chance: 66,
    },
    {
      itemBlueprintKey: AxesBlueprint.SpikedCleaverAxe,
      chance: 68,
    },
    {
      itemBlueprintKey: AxesBlueprint.TimberSplitterAxe,
      chance: 75,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 80,
    },
    {
      itemBlueprintKey: AxesBlueprint.BrutalChopperAxe,
      chance: 85,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 45,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 90,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: 90,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: 95,
    },
    {
      itemBlueprintKey: GemsBlueprint.AmethystGem,
      chance: 4,
    },
    {
      itemBlueprintKey: GemsBlueprint.RubyGem,
      chance: 2,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EarthstoneEmeraldNecklace,
      chance: 7,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireStrandNecklace,
      chance: 18,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyNeckles,
      chance: 18,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenRubyNecklace,
      chance: 22,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SunlitRubyNecklace,
      chance: 22,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalCodex,
      chance: 8,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticCompendium,
      chance: 10,
    },
    {
      itemBlueprintKey: BooksBlueprint.SpellboundCodex,
      chance: 12,
    },
    {
      itemBlueprintKey: BooksBlueprint.PotioncraftPrimer,
      chance: 14,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.ArcaneAdepthat,
      chance: 16,
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
