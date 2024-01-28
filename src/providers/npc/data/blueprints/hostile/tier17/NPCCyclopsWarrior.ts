import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  BootsBlueprint,
  DaggersBlueprint,
  MacesBlueprint,
  PotionsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcCyclopsWarrior: INPCTierBlueprint<17> = {
  ...generateMoveTowardsMovement(),
  name: "Cyclops Warrior",
  key: HostileNPCsBlueprint.CyclopsWarrior,
  textureKey: HostileNPCsBlueprint.CyclopsWarrior,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.ExtraFast,
  tier: 17,
  subType: NPCSubtype.Humanoid,
  baseHealth: 2270,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 168,
    strength: {
      level: 168,
    },
    dexterity: {
      level: 168,
    },
    resistance: {
      level: 168,
    },
    magicResistance: {
      level: 168,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: DaggersBlueprint.CorruptionDagger,
      chance: 25,
    },
    {
      itemBlueprintKey: SwordsBlueprint.FalconsSword,
      chance: 15,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LongSword,
      chance: 20,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.KiteShield,
      chance: 10,
    },
    {
      itemBlueprintKey: PotionsBlueprint.LightEndurancePotion,
      chance: 20,
    },
    {
      itemBlueprintKey: SwordsBlueprint.EonGuardianSword,
      chance: 2,
    },
    {
      itemBlueprintKey: BootsBlueprint.SolarflareBoots,
      chance: 10,
    },
    {
      itemBlueprintKey: MacesBlueprint.ThunderStrikeClub,
      chance: 10,
    },
    {
      itemBlueprintKey: MacesBlueprint.StarfirMaulClub,
      chance: 12,
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: 14,
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
