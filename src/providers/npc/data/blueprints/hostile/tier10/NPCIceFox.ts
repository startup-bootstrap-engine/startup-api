import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AxesBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  OthersBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { AnimationEffectKeys, NPCAlignment, NPCSubtype, RangeTypes } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcIceFox: INPCTierBlueprint<10> = {
  ...generateMoveTowardsMovement(),
  name: "Ice Fox",
  key: HostileNPCsBlueprint.IceFox,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.IceFox,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.Blue,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.ExtraFast,
  baseHealth: 440,
  tier: 10,
  healthRandomizerDice: Dice.D6,
  canSwitchToRandomTarget: true,
  skills: {
    level: 38,
    strength: {
      level: 38,
    },
    dexterity: {
      level: 38,
    },
    resistance: {
      level: 38,
    },
    magicResistance: {
      level: 38,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: RangedWeaponsBlueprint.FrostBow,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.FrostArrow,
      chance: LootProbability.Uncommon,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.FrostCrossbow,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: LootProbability.VeryCommon,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: ShieldsBlueprint.FrostShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.FrostDoubleAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: GlovesBlueprint.ChainGloves,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.FrostDagger,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: LootProbability.SemiCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: FoodsBlueprint.IceMushroom,
      chance: LootProbability.Uncommon,
      quantityRange: [3, 4],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Bone,
      chance: LootProbability.Common,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueFeather,
      chance: LootProbability.Common,
      quantityRange: [3, 5],
    },
    {
      itemBlueprintKey: OthersBlueprint.RoyalChalice,
      chance: LootProbability.Uncommon,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Freezing],
};
