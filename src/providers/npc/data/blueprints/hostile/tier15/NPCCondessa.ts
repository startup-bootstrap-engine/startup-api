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
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.PaviseShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: DaggersBlueprint.CorruptionDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.HasteRing,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.RuneCrossbow,
      chance: LootProbability.VeryRare,
    },

    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.StonefangCleaverClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AxesBlueprint.BattleAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.FlameheartDagger,
      chance: LootProbability.Rare,
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
