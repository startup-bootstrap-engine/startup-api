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
      chance: 30,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: 5,
    },
    {
      itemBlueprintKey: SwordsBlueprint.BroadSword,
      chance: 15,
    },
    {
      itemBlueprintKey: StaffsBlueprint.CorruptionStaff,
      chance: 10,
    },
    {
      itemBlueprintKey: AxesBlueprint.Bardiche,
      chance: 5,
    },
    {
      itemBlueprintKey: BootsBlueprint.Sandals,
      chance: 20,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.DeathsHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.DeathNecklace,
      chance: 5,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.SewingThread,
      chance: 10,
      quantityRange: [3, 5],
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
};
