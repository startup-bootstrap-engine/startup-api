import { INPC } from "@entities/ModuleNPC/NPCModel";
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
import {
  AnimationEffectKeys,
  MagicPower,
  NPCAlignment,
  NPCCustomDeathPenalties,
  RangeTypes,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../abstractions/BaseNeutralNPC";

export const npcMinotaurMage = {
  ...generateMoveTowardsMovement(),
  name: "Minotaur Mage",
  key: HostileNPCsBlueprint.MinotaurMage,
  textureKey: HostileNPCsBlueprint.MinotaurMage,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Standard,
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  baseHealth: 750,
  healthRandomizerDice: Dice.D4,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  isMagic: true,
  skills: {
    level: 80,
    strength: {
      level: 75,
    },
    dexterity: {
      level: 60,
    },
    resistance: {
      level: 30,
    },
    magicResistance: {
      level: 50,
    },
    magic: {
      level: 50,
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
  ],
  entityEffects: [EntityEffectBlueprint.Burning],
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
} as Partial<INPC>;
