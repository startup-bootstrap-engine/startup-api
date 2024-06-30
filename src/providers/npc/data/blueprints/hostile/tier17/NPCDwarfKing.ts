import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  AxesBlueprint,
  BooksBlueprint,
  BootsBlueprint,
  ContainersBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { SpellAreaProbability } from "@providers/spells/area-spells/NPCSpellAreaTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcDwarfKing: INPCTierBlueprint<17> = {
  ...generateMoveTowardsMovement(),
  name: "Dwarf King",
  subType: NPCSubtype.Humanoid,
  tier: 17,
  key: HostileNPCsBlueprint.DwarfGuardian,
  textureKey: HostileNPCsBlueprint.DwarfGuardian,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.ExtraFast,
  // @ts-ignore
  baseHealth: 10000,
  isGiantForm: true,
  healthRandomizerDice: Dice.D12,
  canSwitchToRandomTarget: true,
  skills: {
    level: 178,
    strength: {
      level: 178,
    },
    dexterity: {
      level: 178,
    },
    resistance: {
      level: 178,
    },
    magicResistance: {
      level: 178,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: ContainersBlueprint.Backpack,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.TurnipSeed,
      chance: LootProbability.Common,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: StaffsBlueprint.MoonsStaff,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.RoyalDoubleAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: HammersBlueprint.WarHammer,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ToolsBlueprint.MoonlureFishingRod,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.ScutumShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: GlovesBlueprint.ChainGloves,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.IronArrow,
      chance: LootProbability.VeryCommon,
      quantityRange: [10, 30],
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedMace,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: HelmetsBlueprint.GladiatorHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyRing,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.KingsGuardLegs,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.StonefangCleaverClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalStoneScepter,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.FlameheartDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ArrowheadDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenRubyNecklace,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.CherryRing,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalGrimoire,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: BooksBlueprint.PotioncraftPrimer,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Salmon,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyRing,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SpearsBlueprint.Corseque,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 6],
    },
    {
      itemBlueprintKey: HelmetsBlueprint.BerserkersHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyRing,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SpearsBlueprint.Corseque,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.EnchantedSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.CorruptionDagger,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.EnchantedSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.VerdantDagger,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: AxesBlueprint.MoonBeamAxe,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: BootsBlueprint.BronzeBoots,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BootsBlueprint.RoyalBoots,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SpearsBlueprint.GuanDao,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.PoisonSword,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: DaggersBlueprint.CopperJitte,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.DamascusJitte,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: SpearsBlueprint.Trident,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.KnightsSword,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HammersBlueprint.WarHammer,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.InfantryHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.BasiliskSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CopperBroadsword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Jade,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: SwordsBlueprint.PixieCutSword,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.StellarBlade,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.EmberEdgePickaxe,
      chance: LootProbability.VeryRare,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CleavingStomp,
      probability: 50,
      power: MagicPower.High,
    },
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 10,
      power: MagicPower.Medium,
    },
    {
      spellKey: SpellsBlueprint.SelfHealingSpell,
      probability: SpellAreaProbability.Common,
      power: MagicPower.High,
    },
  ],
};
