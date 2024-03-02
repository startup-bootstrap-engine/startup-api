import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";

export const npcCaveSpider: INPCTierBlueprint<3> = {
  ...generateMoveTowardsMovement(),
  name: "Cave Spider",
  key: HostileNPCsBlueprint.CaveSpider,
  subType: NPCSubtype.Insect,
  textureKey: HostileNPCsBlueprint.CaveSpider,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  baseHealth: 140,
  tier: 3,
  healthRandomizerDice: Dice.D6,
  skills: {
    level: 10,
    strength: {
      level: 9,
    },
    dexterity: {
      level: 9,
    },
    resistance: {
      level: 7,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Herb,
      chance: LootProbability.SemiCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.BroadSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: StaffsBlueprint.CorruptionStaff,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.Bardiche,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BootsBlueprint.Sandals,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.DeathsHelmet,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.DeathNecklace,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.SewingThread,
      chance: LootProbability.Uncommon,
      quantityRange: [3, 5],
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
};
