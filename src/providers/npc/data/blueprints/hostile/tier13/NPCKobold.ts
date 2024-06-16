import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  LegsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { SpellAreaProbability } from "@providers/spells/area-spells/NPCSpellAreaTypes";
import {
  AnimationEffectKeys,
  MagicPower,
  NPCAlignment,
  NPCSubtype,
  RangeTypes,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcKobold: INPCTierBlueprint<13> = {
  ...generateMoveTowardsMovement(),
  name: "Kobold",
  key: HostileNPCsBlueprint.Kobold,
  textureKey: HostileNPCsBlueprint.Kobold,
  tier: 13,
  subType: NPCSubtype.Humanoid,
  alignment: NPCAlignment.Hostile,
  speed: MovementSpeed.Standard,
  baseHealth: 920,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  skills: {
    level: 65,
    strength: {
      level: 65,
    },
    dexterity: {
      level: 65,
    },
    resistance: {
      level: 65,
    },
    magicResistance: {
      level: 65,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: LootProbability.VeryCommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: SeedsBlueprint.EggplantSeed,
      chance: LootProbability.Common,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: LootProbability.Rare,
      quantityRange: [1, 4],
    },
    {
      itemBlueprintKey: BootsBlueprint.IronBoots,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueSapphire,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: LegsBlueprint.BronzeLegs,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: ShieldsBlueprint.TowerShield,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: LootProbability.Rare,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Burning],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.FireStorm,
      probability: 5,
      power: MagicPower.Low,
    },

    {
      spellKey: SpellsBlueprint.SelfHealingSpell,
      probability: SpellAreaProbability.Rare,
      power: MagicPower.Low,
    },
  ],
};
