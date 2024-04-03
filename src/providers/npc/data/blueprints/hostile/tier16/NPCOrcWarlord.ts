import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  BooksBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  SeedsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCCustomDeathPenalties, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcOrcWarlord: INPCTierBlueprint<16> = {
  ...generateMoveTowardsMovement(),
  name: "Orc Warlord",
  key: HostileNPCsBlueprint.OrcWarlord,
  textureKey: HostileNPCsBlueprint.OrcWarlord,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.ExtraFast,
  baseHealth: 1970,
  tier: 16,
  isGiantForm: true,
  subType: NPCSubtype.Humanoid,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  skills: {
    level: 118,
    strength: {
      level: 118,
    },
    dexterity: {
      level: 118,
    },
    resistance: {
      level: 118,
    },
    magicResistance: {
      level: 118,
    },
  },
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.Cookie,
      chance: LootProbability.VeryCommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: DaggersBlueprint.VerdantDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.VikingHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.WatermelonSeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
    },

    {
      itemBlueprintKey: SwordsBlueprint.LightingSword,
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
      itemBlueprintKey: HelmetsBlueprint.AmethystArchmageHat,
      chance: LootProbability.Rare,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CleavingStomp,
      probability: 10,
      power: MagicPower.High,
    },
  ],
};
