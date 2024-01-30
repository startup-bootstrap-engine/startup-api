import { INPC } from "@entities/ModuleNPC/NPCModel";
import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  AxesBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../abstractions/BaseNeutralNPC";

export const npcForestCyclops = {
  ...generateMoveTowardsMovement(),
  name: "Forest Cyclops",
  key: HostileNPCsBlueprint.ForestCyclops,
  textureKey: HostileNPCsBlueprint.ForestCyclops,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: RangedWeaponsBlueprint.Stone,
  maxRangeAttack: 6,
  speed: MovementSpeed.Slow,
  baseHealth: 1200,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 75,
    strength: {
      level: 50,
    },
    dexterity: {
      level: 50,
    },
    resistance: {
      level: 60,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: 15,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.AmethystHelmet,
      chance: 10,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.BanditShield,
      chance: 15,
    },
    {
      itemBlueprintKey: SwordsBlueprint.BasiliskSword,
      chance: 15,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.ForestHeartPendant,
      chance: 2,
    },
    {
      itemBlueprintKey: LegsBlueprint.AzureFrostLegs,
      chance: 5,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: 6,
    },
    {
      itemBlueprintKey: MacesBlueprint.IronWoodCrusherClub,
      chance: 8,
    },
    {
      itemBlueprintKey: AxesBlueprint.TimberSplitterAxe,
      chance: 10,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 11,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison, EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.NaturesRevenge,
      probability: 5,
      power: MagicPower.Medium,
    },
  ],
} as Partial<INPC>;
