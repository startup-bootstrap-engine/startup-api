import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  ContainersBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GemsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcDwarfGuardian: INPCTierBlueprint<12> = {
  ...generateMoveTowardsMovement(),
  name: "Dwarf Guardian",
  subType: NPCSubtype.Humanoid,
  tier: 12,
  key: HostileNPCsBlueprint.DwarfGuardian,
  textureKey: HostileNPCsBlueprint.DwarfGuardian,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  baseHealth: 720,
  isGiantForm: true,
  healthRandomizerDice: Dice.D12,
  canSwitchToRandomTarget: true,
  skills: {
    level: 53,
    strength: {
      level: 53,
    },
    dexterity: {
      level: 56,
    },
    resistance: {
      level: 56,
    },
    magicResistance: {
      level: 56,
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
    {
      itemBlueprintKey: GemsBlueprint.EarthstoneGem,
      chance: LootProbability.Uncommon,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CleavingStomp,
      probability: 50,
      power: MagicPower.High,
    },
  ],
};
