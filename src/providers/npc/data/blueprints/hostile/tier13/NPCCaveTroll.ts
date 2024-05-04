import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GemsBlueprint,
  GlovesBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  MagicsBlueprint,
  PotionsBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcCaveTroll: INPCTierBlueprint<13> = {
  ...generateMoveTowardsMovement(),
  name: "Cave Troll",
  key: HostileNPCsBlueprint.CaveTroll,
  textureKey: HostileNPCsBlueprint.CaveTroll,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  baseHealth: 920,
  tier: 13,
  subType: NPCSubtype.Humanoid,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 74,
    strength: {
      level: 74,
    },
    dexterity: {
      level: 74,
    },
    resistance: {
      level: 74,
    },
    magicResistance: {
      level: 74,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.PotatoSeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: HelmetsBlueprint.WingHelmet,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.KiteShield,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: SwordsBlueprint.LongSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: GlovesBlueprint.ChainGloves,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: PotionsBlueprint.LightEndurancePotion,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: LootProbability.VeryCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.ElvenBow,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: FoodsBlueprint.Salmon,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.GreaterWoodenLog,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: SwordsBlueprint.DoubleEdgedSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MagicsBlueprint.FireRune,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SpikedShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.GreenOre,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: MacesBlueprint.WitchBaneMace,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.WoodBreakerAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.EmberEdgePickaxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: GemsBlueprint.AmethystGem,
      chance: LootProbability.Uncommon,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
};
