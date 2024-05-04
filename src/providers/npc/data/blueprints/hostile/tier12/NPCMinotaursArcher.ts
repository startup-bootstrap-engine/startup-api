import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GemsBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { MagicPower, NPCAlignment, NPCSubtype, RangeTypes, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcMinotaurArcher: INPCTierBlueprint<12> = {
  ...generateMoveTowardsMovement(),
  name: "Minotaur Archer",
  key: HostileNPCsBlueprint.MinotaurArcher,
  subType: NPCSubtype.Humanoid,
  textureKey: HostileNPCsBlueprint.MinotaurArcher,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: RangedWeaponsBlueprint.Arrow,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Fast,
  tier: 12,
  canSwitchToLowHealthTarget: true,
  baseHealth: 720,
  healthRandomizerDice: Dice.D8,
  skillRandomizerDice: Dice.D8,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 53,
    strength: {
      level: 53,
    },
    dexterity: {
      level: 53,
    },
    resistance: {
      level: 53,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: BootsBlueprint.RoyalBoots,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SeedsBlueprint.PotatoSeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: DaggersBlueprint.IronJitte,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.RoyalCrossbow,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.FireBolt,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: ArmorsBlueprint.BronzeArmor,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Jade,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Herb,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WaterBottle,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.EaglesEyeBow,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.LogSplitterAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: GemsBlueprint.EarthstoneGem,
      chance: LootProbability.VeryRare,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Burning],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.WildfireVolley,
      probability: 50,
      power: MagicPower.High,
    },
  ],
};
