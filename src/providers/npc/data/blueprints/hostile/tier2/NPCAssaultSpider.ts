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
      chance: 5,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.DarkWizardHat,
      chance: 20,
    },
    {
      itemBlueprintKey: StaffsBlueprint.CorruptionStaff,
      chance: 5,
    },
    {
      itemBlueprintKey: DaggersBlueprint.CorruptionDagger,
      chance: 15,
    },

    {
      itemBlueprintKey: AccessoriesBlueprint.CorruptionNecklace,
      chance: 10,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.StarNecklace,
      chance: 6,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.SewingThread,
      chance: 10,
      quantityRange: [3, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.MagicRecipe,
      chance: 10,
      quantityRange: [1, 5],
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
};
