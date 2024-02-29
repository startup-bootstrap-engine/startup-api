import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  AxesBlueprint,
  BooksBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
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
      chance: 75,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: DaggersBlueprint.VerdantDagger,
      chance: 25,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.VikingHelmet,
      chance: 10,
    },

    {
      itemBlueprintKey: SwordsBlueprint.LightingSword,
      chance: 15,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyRing,
      chance: 10,
    },
    {
      itemBlueprintKey: LegsBlueprint.KingsGuardLegs,
      chance: 5,
    },
    {
      itemBlueprintKey: MacesBlueprint.StonefangCleaverClub,
      chance: 6,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: 8,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalStoneScepter,
      chance: 10,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: 12,
    },
    {
      itemBlueprintKey: AxesBlueprint.DualImpactAxe,
      chance: 14,
    },
    {
      itemBlueprintKey: AxesBlueprint.MaulAxe,
      chance: 16,
    },
    {
      itemBlueprintKey: AxesBlueprint.CrownSplitterAxe,
      chance: 18,
    },
    {
      itemBlueprintKey: DaggersBlueprint.FlameheartDagger,
      chance: 18,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ArrowheadDagger,
      chance: 16,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenRubyNecklace,
      chance: 2,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.CherryRing,
      chance: 8,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalGrimoire,
      chance: 3,
    },
    {
      itemBlueprintKey: BooksBlueprint.PotioncraftPrimer,
      chance: 4,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.AmethystArchmageHat,
      chance: 7,
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