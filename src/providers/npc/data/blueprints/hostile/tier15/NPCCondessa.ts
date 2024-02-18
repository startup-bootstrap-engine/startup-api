import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  AxesBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
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

export const npcCondessa: INPCTierBlueprint<15> = {
  ...generateMoveTowardsMovement(),
  name: "Condessa",
  key: HostileNPCsBlueprint.Condessa,
  textureKey: HostileNPCsBlueprint.Condessa,
  alignment: NPCAlignment.Hostile,
  speed: MovementSpeed.Fast,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.Dark,
  maxRangeAttack: RangeTypes.High,
  baseHealth: 1470,
  tier: 15,
  subType: NPCSubtype.Humanoid,
  healthRandomizerDice: Dice.D12,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  skills: {
    level: 92,
    strength: {
      level: 92,
    },
    dexterity: {
      level: 92,
    },
    resistance: {
      level: 92,
    },
    magicResistance: {
      level: 92,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: StaffsBlueprint.PoisonWand,
      chance: 10,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.PaviseShield,
      chance: 15,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: 15,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: 35,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: DaggersBlueprint.CorruptionDagger,
      chance: 5,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.HasteRing,
      chance: 1,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.RuneCrossbow,
      chance: 1,
    },

    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 4,
    },
    {
      itemBlueprintKey: MacesBlueprint.StonefangCleaverClub,
      chance: 6,
    },
    {
      itemBlueprintKey: AxesBlueprint.DualImpactAxe,
      chance: 8,
    },
    {
      itemBlueprintKey: AxesBlueprint.BattleAxe,
      chance: 10,
    },
    {
      itemBlueprintKey: AxesBlueprint.CrownSplitterAxe,
      chance: 12,
    },
    {
      itemBlueprintKey: DaggersBlueprint.FlameheartDagger,
      chance: 12,
    },
    {
      itemBlueprintKey: SwordsBlueprint.VenomousStinger,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.VenomousFang,
      chance: 10,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 10,
      power: MagicPower.Medium,
    },
  ],
};
