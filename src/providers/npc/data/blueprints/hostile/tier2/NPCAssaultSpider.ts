import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  StaffsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";

export const npcAssaultSpider: INPCTierBlueprint<2> = {
  ...generateMoveTowardsMovement(),
  name: "Assault Spider",
  key: HostileNPCsBlueprint.AssaultSpider,
  textureKey: HostileNPCsBlueprint.AssaultSpider,
  subType: NPCSubtype.Insect,

  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  tier: 2,
  baseHealth: 100,
  healthRandomizerDice: Dice.D6,
  skills: {
    level: 5.5,
    strength: {
      level: 4.5,
    },
    dexterity: {
      level: 6,
    },
    resistance: {
      level: 4.5,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.DarkWizardHat,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: StaffsBlueprint.CorruptionStaff,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.CorruptionDagger,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: AccessoriesBlueprint.CorruptionNecklace,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.StarNecklace,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.SewingThread,
      chance: LootProbability.Uncommon,
      quantityRange: [3, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.MagicRecipe,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
};
