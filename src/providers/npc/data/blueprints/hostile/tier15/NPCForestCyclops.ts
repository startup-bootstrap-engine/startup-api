import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcForestCyclops: INPCTierBlueprint<15> = {
  ...generateMoveTowardsMovement(),
  name: "Forest Cyclops",
  key: HostileNPCsBlueprint.ForestCyclops,
  textureKey: HostileNPCsBlueprint.ForestCyclops,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: RangedWeaponsBlueprint.Stone,
  maxRangeAttack: 6,
  tier: 15,
  subType: NPCSubtype.Humanoid,
  speed: MovementSpeed.Slow,
  baseHealth: 1320,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 89,
    strength: {
      level: 89,
    },
    dexterity: {
      level: 89,
    },
    resistance: {
      level: 89,
    },
    magicResistance: {
      level: 89,
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
  ],
  entityEffects: [EntityEffectBlueprint.Poison, EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.NaturesRevenge,
      probability: 10,
      power: MagicPower.Medium,
    },
  ],
};
