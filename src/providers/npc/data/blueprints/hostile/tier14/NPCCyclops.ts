import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AxesBlueprint,
  DaggersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcCyclops: INPCTierBlueprint<14> = {
  ...generateMoveTowardsMovement(),
  name: "Cyclops",
  key: HostileNPCsBlueprint.Cyclops,
  textureKey: HostileNPCsBlueprint.Cyclops,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Slow,
  baseHealth: 1220,
  tier: 14,
  subType: NPCSubtype.Humanoid,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 77,
    strength: {
      level: 77,
    },
    dexterity: {
      level: 77,
    },
    resistance: {
      level: 77,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: MacesBlueprint.HellishKingMace,
      chance: 25,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.CrownHelmet,
      chance: 10,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.FalconsShield,
      chance: 15,
    },

    {
      itemBlueprintKey: SwordsBlueprint.EnchantedSword,
      chance: 15,
    },
    {
      itemBlueprintKey: DaggersBlueprint.VerdantDagger,
      chance: 10,
    },
    {
      itemBlueprintKey: LegsBlueprint.PlatinumTintLegs,
      chance: 5,
    },
    {
      itemBlueprintKey: MacesBlueprint.StarfirMaulClub,
      chance: 12,
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: 14,
    },
    {
      itemBlueprintKey: AxesBlueprint.BoneReaperAxe,
      chance: 16,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 18,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: 10,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
};
