import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  FoodsBlueprint,
  MagicsBlueprint,
  PotionsBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcWildCyclops: INPCTierBlueprint<16> = {
  ...generateMoveTowardsMovement(),
  name: "Wild Cyclops",
  key: HostileNPCsBlueprint.WildCyclops,
  textureKey: HostileNPCsBlueprint.WildCyclops,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Slow,
  tier: 16,
  subType: NPCSubtype.Humanoid,
  baseHealth: 1770,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 108,
    strength: {
      level: 108,
    },
    dexterity: {
      level: 108,
    },
    resistance: {
      level: 108,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.AzureMachete,
      chance: 15,
    },

    {
      itemBlueprintKey: PotionsBlueprint.ManaPotion,
      chance: 30,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.IronArrow,
      chance: 20,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.PhoenixBow,
      chance: 10,
    },

    {
      itemBlueprintKey: FoodsBlueprint.Coconut,
      chance: 15,
    },
    {
      itemBlueprintKey: SwordsBlueprint.FalconsSword,
      chance: 15,
    },
    {
      itemBlueprintKey: MagicsBlueprint.PoisonRune,
      chance: 10,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: ShieldsBlueprint.StuddedShield,
      chance: 20,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
};
