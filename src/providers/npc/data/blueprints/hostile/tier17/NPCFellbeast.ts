import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  AxesBlueprint,
  BooksBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  SpearsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { AnimationEffectKeys, MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcFellbeast: INPCTierBlueprint<17> = {
  ...generateMoveTowardsMovement(),
  name: "FellBeast",
  key: HostileNPCsBlueprint.Fellbeast,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.Fellbeast,
  alignment: NPCAlignment.Hostile,
  speed: MovementSpeed.ExtraFast,
  baseHealth: 2070,
  tier: 17,
  healthRandomizerDice: Dice.D6,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.Green,
  maxRangeAttack: 6,
  canSwitchToLowHealthTarget: true,
  canSwitchToRandomTarget: true,
  skills: {
    level: 148,
    strength: {
      level: 148,
    },
    dexterity: {
      level: 148,
    },
    resistance: {
      level: 148,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: 25,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: 35,
      quantityRange: [1, 6],
    },
    {
      itemBlueprintKey: HelmetsBlueprint.BerserkersHelmet,
      chance: 10,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyRing,
      chance: 2,
    },
    {
      itemBlueprintKey: SpearsBlueprint.Corseque,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.EnchantedSword,
      chance: 15,
    },
    {
      itemBlueprintKey: DaggersBlueprint.CorruptionDagger,
      chance: 5,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Skull,
      chance: 50,
      quantityRange: [1, 10],
    },

    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 5,
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: 5,
    },
    {
      itemBlueprintKey: MacesBlueprint.SunderingClub,
      chance: 6,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 7,
    },
    {
      itemBlueprintKey: AxesBlueprint.BrutalChopperAxe,
      chance: 8,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: 18,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 20,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 22,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyglintNecklace,
      chance: 2,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.QuantumSunRing,
      chance: 8,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticCompendium,
      chance: 3,
    },
    {
      itemBlueprintKey: BooksBlueprint.DruidicLoreVolume,
      chance: 6,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.AmethystArchmageHat,
      chance: 7,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.NaturesRevenge,
      probability: 10,
      power: MagicPower.Low,
    },
  ],
};
