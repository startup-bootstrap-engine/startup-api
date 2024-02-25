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

export const npcRedNaga: INPCTierBlueprint<25> = {
  ...generateMoveTowardsMovement(),
  name: "Red Naga",
  key: HostileNPCsBlueprint.RedNaga,
  textureKey: HostileNPCsBlueprint.RedNaga,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Standard,
  tier: 25,
  subType: NPCSubtype.Humanoid,
  baseHealth: 7370,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  isMagic: true,
  skills: {
    level: 678,
    strength: {
      level: 678,
    },
    dexterity: {
      level: 678,
    },
    resistance: {
      level: 678,
    },
    magicResistance: {
      level: 678,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: 34,
    },
    {
      itemBlueprintKey: SwordsBlueprint.InfernoCleaver,
      chance: 12,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonHead,
      chance: 126,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonTooth,
      chance: 122,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilJianSword,
      chance: 14,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 40,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: 40,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: 40,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.TemplarsPlate,
      chance: 30,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: 38,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 38,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: 34,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: 34,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 52,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 50,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: 18,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: 19,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: 19,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 50,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: 24,
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilTemplarSword,
      chance: 28,
    },
    {
      itemBlueprintKey: MacesBlueprint.SunderingClub,
      chance: 70,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 94,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 72,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 98,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: 60,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: 74,
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: 84,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: 86,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: 60,
    },
    {
      itemBlueprintKey: AxesBlueprint.WarAxe,
      chance: 70,
    },
    {
      itemBlueprintKey: AxesBlueprint.DanishAxe,
      chance: 78,
    },
    {
      itemBlueprintKey: AxesBlueprint.SpikedCleaverAxe,
      chance: 80,
    },
    {
      itemBlueprintKey: AxesBlueprint.TimberSplitterAxe,
      chance: 87,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 92,
    },
    {
      itemBlueprintKey: AxesBlueprint.BrutalChopperAxe,
      chance: 97,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 58,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 105,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: 105,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: 108,
    },
    {
      itemBlueprintKey: GemsBlueprint.AmethystGem,
      chance: 16,
    },
    {
      itemBlueprintKey: GemsBlueprint.RubyGem,
      chance: 12,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EarthstoneEmeraldNecklace,
      chance: 18,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireStrandNecklace,
      chance: 32,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyNeckles,
      chance: 34,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenRubyNecklace,
      chance: 34,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SunlitRubyNecklace,
      chance: 33,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalCodex,
      chance: 16,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticCompendium,
      chance: 22,
    },
    {
      itemBlueprintKey: BooksBlueprint.SpellboundCodex,
      chance: 24,
    },
    {
      itemBlueprintKey: BooksBlueprint.PotioncraftPrimer,
      chance: 26,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.ArcaneAdepthat,
      chance: 30,
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
