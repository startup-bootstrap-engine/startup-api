import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  BooksBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  HelmetsBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
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

export const npcConde: INPCTierBlueprint<16> = {
  ...generateMoveTowardsMovement(),
  name: "Conde",
  tier: 16,
  subType: NPCSubtype.Humanoid,
  key: HostileNPCsBlueprint.Conde,
  textureKey: HostileNPCsBlueprint.Conde,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.Dark,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Standard,
  canSwitchToRandomTarget: true,
  baseHealth: 1970,
  canSwitchToLowHealthTarget: true,
  healthRandomizerDice: Dice.D12,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  skills: {
    level: 108,
    strength: {
      level: 108,
    },
    dexterity: {
      level: 108,
    },
    resistance: {
      level: 108,
    },
    magicResistance: {
      level: 108,
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
      itemBlueprintKey: DaggersBlueprint.HellishDagger,
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
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 18,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ArrowheadDagger,
      chance: 16,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EmberglowNecklace,
      chance: 2,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyTriquetraRing,
      chance: 8,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticCompendium,
      chance: 3,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticalMemoirs,
      chance: 4,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.AmethystArchmageHat,
      chance: 7,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Freezing],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 10,
      power: MagicPower.Medium,
    },
    {
      spellKey: SpellsBlueprint.Blizzard,
      probability: 25,
      power: MagicPower.UltraHigh,
    },
  ],
};
