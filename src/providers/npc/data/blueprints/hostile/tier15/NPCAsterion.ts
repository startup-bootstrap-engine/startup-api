import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  BootsBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  LegsBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { generateMoveTowardsMovement } from "@providers/npc/data/abstractions/BaseNeutralNPC";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";

import { NPCAlignment, NPCCustomDeathPenalties } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";

export const npcAsterion: INPCTierBlueprint<15> = {
  ...generateMoveTowardsMovement(),
  name: "Asterion",
  key: HostileNPCsBlueprint.Asterion,
  textureKey: HostileNPCsBlueprint.Minotaur,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  canSwitchToLowHealthTarget: true,
  // @ts-ignore
  baseHealth: 2500,
  healthRandomizerDice: Dice.D20,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,

  skills: {
    level: 95,
    strength: {
      level: 95,
    },
    dexterity: {
      level: 95,
    },
    resistance: {
      level: 95,
    },
    magicResistance: {
      level: 95,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: 20,
    },
    {
      itemBlueprintKey: SwordsBlueprint.MinotaurSword,
      chance: 2,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: 30,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: 85,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: 30,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.AsterionsBow,
      chance: 40,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.IronArrow,
      chance: 25,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: 60,
    },
    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: 20,
    },

    {
      itemBlueprintKey: ShieldsBlueprint.TowerShield,
      chance: 5,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: 30,
    },
    {
      itemBlueprintKey: StaffsBlueprint.SkyBlueStaff,
      chance: 5,
    },
    {
      itemBlueprintKey: StaffsBlueprint.TartarusStaff,
      chance: 1,
    },
    {
      itemBlueprintKey: GlovesBlueprint.JadeclaspGloves,
      chance: 1,
    },
  ],
};
