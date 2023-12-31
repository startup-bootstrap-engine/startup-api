import { INPC } from "@entities/ModuleNPC/NPCModel";
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
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";

import { NPCAlignment, NPCCustomDeathPenalties } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";

export const npcAsterion = {
  ...generateMoveTowardsMovement(),
  name: "Asterion",
  key: HostileNPCsBlueprint.Asterion,
  textureKey: HostileNPCsBlueprint.Minotaur,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  canSwitchToLowHealthTarget: true,
  baseHealth: 2500,
  healthRandomizerDice: Dice.D20,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,

  skills: {
    level: 70,
    strength: {
      level: 70,
    },
    dexterity: {
      level: 30,
    },
    resistance: {
      level: 40,
    },
    magicResistance: {
      level: 80,
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
} as Partial<INPC>;
