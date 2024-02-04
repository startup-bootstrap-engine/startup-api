import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  AxesBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcCaveCyclops: INPCTierBlueprint<15> = {
  ...generateMoveTowardsMovement(),
  name: "Cave Cyclops",
  key: HostileNPCsBlueprint.CaveCyclops,
  textureKey: HostileNPCsBlueprint.CaveCyclops,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Slow,
  baseHealth: 1420,
  tier: 15,
  subType: NPCSubtype.Humanoid,
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
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: AxesBlueprint.GoldenAxe,
      chance: 25,
    },
    {
      itemBlueprintKey: DaggersBlueprint.PhoenixDagger,
      chance: 15,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.HellishBow,
      chance: 5,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.ObsidiumOre,
      chance: 15,
    },

    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireRing,
      chance: 10,
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
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: 9,
    },
    {
      itemBlueprintKey: AxesBlueprint.MaulAxe,
      chance: 13,
    },
    {
      itemBlueprintKey: AxesBlueprint.SpikeToppedAxe,
      chance: 16,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 12,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CleavingStomp,
      probability: 50,
      power: MagicPower.High,
    },
  ],
};
