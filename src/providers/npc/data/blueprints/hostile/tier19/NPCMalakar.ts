import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  DaggersBlueprint,
  GemsBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCCustomDeathPenalties, RangeTypes } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcMalakarLichKing: INPCTierBlueprint<19> = {
  ...generateMoveTowardsMovement(),
  name: "Malakar, the Lich King",
  key: HostileNPCsBlueprint.MalakarLichKing,
  textureKey: HostileNPCsBlueprint.Litch,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  // @ts-ignore
  ammoKey: "fireball",
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
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: 10,
    },
    {
      itemBlueprintKey: LegsBlueprint.BloodfireLegs,
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
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: 20,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 30,
    },
    {
      itemBlueprintKey: AxesBlueprint.IroncladCleaver,
      chance: 40,
    },
    {
      itemBlueprintKey: AxesBlueprint.MaulAxe,
      chance: 39,
    },
    {
      itemBlueprintKey: AxesBlueprint.TwinEdgeAxe,
      chance: 40,
    },
    {
      itemBlueprintKey: AxesBlueprint.SavageSmasher,
      chance: 42,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 28,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: 30,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: 34,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ArrowheadDagger,
      chance: 36,
    },
    {
      itemBlueprintKey: GemsBlueprint.CoralReefGem,
      chance: 1,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Burning, EntityEffectBlueprint.Corruption],
};
