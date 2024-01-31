import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { AnimationEffectKeys, NPCAlignment, NPCCustomDeathPenalties, RangeTypes } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcEloraTheQueen: INPCTierBlueprint<19> = {
  ...generateMoveTowardsMovement(),
  name: "Elora, the Queen",
  key: HostileNPCsBlueprint.EloraTheQueen,
  // @ts-ignore
  textureKey: "green-druid",
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,

  ammoKey: AnimationEffectKeys.Green,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.ExtraFast,
  // @ts-ignore
  baseHealth: 50000,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,

  skills: {
    level: 258,
    strength: {
      level: 258,
    },
    dexterity: {
      level: 258,
    },
    resistance: {
      level: 258,
    },
    magicResistance: {
      level: 258,
    },
    magic: {
      level: 258,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 20,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: 20,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 20,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: 15,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: 10,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 30,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 30,
    },

    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: 5,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 30,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.CrimsonAegisShield,
      chance: 30,
    },
    {
      itemBlueprintKey: StaffsBlueprint.SangriaStaff,
      chance: 30,
    },
    {
      itemBlueprintKey: StaffsBlueprint.TartarusStaff,
      chance: 30,
    },
    {
      itemBlueprintKey: AxesBlueprint.DualImpactAxe,
      chance: 28,
    },
    {
      itemBlueprintKey: AxesBlueprint.MaulAxe,
      chance: 32,
    },
    {
      itemBlueprintKey: AxesBlueprint.HammerCleaveAxe,
      chance: 30,
    },
    {
      itemBlueprintKey: AxesBlueprint.RoyalChopperAxe,
      chance: 34,
    },
  ],
  entityEffects: [EntityEffectBlueprint.VineGrasp],
};
