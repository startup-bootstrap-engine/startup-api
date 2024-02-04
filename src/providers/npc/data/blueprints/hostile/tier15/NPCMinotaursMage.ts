import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
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

export const npcMinotaurMage: INPCTierBlueprint<15> = {
  ...generateMoveTowardsMovement(),
  name: "Minotaur Mage",
  key: HostileNPCsBlueprint.MinotaurMage,
  textureKey: HostileNPCsBlueprint.MinotaurMage,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Standard,
  tier: 15,
  subType: NPCSubtype.Humanoid,
  canSwitchToLowHealthTarget: true,
  canSwitchToRandomTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  baseHealth: 1370,
  healthRandomizerDice: Dice.D4,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  isMagic: true,
  skills: {
    level: 95,
    strength: {
      level: 95,
    },
    dexterity: {
      level: 89,
    },
    resistance: {
      level: 95,
    },
    magicResistance: {
      level: 98,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueFeather,
      chance: 20,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WaterBottle,
      chance: 20,
      quantityRange: [1, 5],
    },

    {
      itemBlueprintKey: StaffsBlueprint.MoonsStaff,
      chance: 5,
    },
    {
      itemBlueprintKey: StaffsBlueprint.RoyalStaff,
      chance: 7,
    },
    {
      itemBlueprintKey: StaffsBlueprint.TartarusStaff,
      chance: 1,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: 10,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: 30,
    },

    {
      itemBlueprintKey: StaffsBlueprint.EnchantedStaff,
      chance: 5,
    },
    {
      itemBlueprintKey: StaffsBlueprint.SoulStaff,
      chance: 5,
    },

    {
      itemBlueprintKey: SwordsBlueprint.GoldenSword,
      chance: 4,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: 20,
    },
    {
      itemBlueprintKey: DaggersBlueprint.PhoenixDagger,
      chance: 20,
    },
    {
      itemBlueprintKey: DaggersBlueprint.PhoenixJitte,
      chance: 20,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.FoodRecipe,
      chance: 10,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Eye,
      chance: 50,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Herb,
      chance: 55,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PolishedStone,
      chance: 50,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.RuneCrossbow,
      chance: 1,
    },

    {
      itemBlueprintKey: ShieldsBlueprint.DarkShield,
      chance: 1,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PhoenixFeather,
      chance: 30,
      quantityRange: [5, 8],
    },
    {
      itemBlueprintKey: SpearsBlueprint.PoseidonTrident,
      chance: 2,
    },
    {
      itemBlueprintKey: HammersBlueprint.GoldHammer,
      chance: 2,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WeaponRecipe,
      chance: 10,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ArrowheadDagger,
      chance: 12,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Burning, EntityEffectBlueprint.Freezing],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.FireStorm,
      probability: 10,
      power: MagicPower.Medium,
    },
    {
      spellKey: SpellsBlueprint.Blizzard,
      probability: 10,
      power: MagicPower.Medium,
    },
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 10,
      power: MagicPower.Medium,
    },
  ],
};
