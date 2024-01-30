import { INPC } from "@entities/ModuleNPC/NPCModel";
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
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCCustomDeathPenalties } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcEloraTheQueen: Partial<INPC> = {
  ...generateMoveTowardsMovement(),
  name: "Elora, the Queen",
  key: HostileNPCsBlueprint.EloraTheQueen,
  textureKey: "green-druid",
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: "fireball",
  maxRangeAttack: 8,
  speed: MovementSpeed.ExtraFast,
  baseHealth: 50000,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,

  skills: {
    level: 250,
    strength: {
      level: 200,
    },
    dexterity: {
      level: 200,
    },
    resistance: {
      level: 200,
    },
    magicResistance: {
      level: 200,
    },
    magic: {
      level: 200,
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
