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
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
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

export const npcIceOrc: INPCTierBlueprint<26> = {
  ...generateMoveTowardsMovement(),
  name: "Ice Orc",
  key: HostileNPCsBlueprint.IceOrc,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.IceOrc,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.FireBall,
  tier: 26,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.ExtraFast,
  // @ts-ignore
  baseHealth: 700000,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  canSwitchToRandomTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,

  isMagic: true,
  skills: {
    level: 778,
    strength: {
      level: 778,
    },
    dexterity: {
      level: 778,
    },
    resistance: {
      level: 778,
    },
    magicResistance: {
      level: 778,
    },
    magic: {
      level: 778,
    },
  },
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.InfernoCleaver,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BooksBlueprint.AstralGlobe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonHead,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonTooth,
      chance: LootProbability.VeryCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilJianSword,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.TemplarsPlate,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: LootProbability.SemiCommon,
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
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilTemplarSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.SunderingClub,
      chance: LootProbability.Common,
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
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: LootProbability.Common,
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
      chance: LootProbability.Common,
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
      chance: LootProbability.Common,
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
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: GemsBlueprint.RubyGem,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EarthstoneEmeraldNecklace,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireStrandNecklace,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyNeckles,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenRubyNecklace,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SunlitRubyNecklace,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalCodex,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticCompendium,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.SpellboundCodex,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BooksBlueprint.PotioncraftPrimer,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.ArcaneAdepthat,
      chance: LootProbability.Uncommon,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Freezing, EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Corruption],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.FrostArrowCreation,
      probability: 40,
      power: MagicPower.Medium,
    },
    {
      spellKey: SpellsBlueprint.FrostBolt,
      probability: 50,
      power: MagicPower.High,
    },
    {
      spellKey: SpellsBlueprint.Arrowstorm,
      probability: 70,
      power: MagicPower.UltraHigh,
    },
  ],
};
