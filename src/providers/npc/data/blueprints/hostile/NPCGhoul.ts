import { INPC } from "@entities/ModuleNPC/NPCModel";
import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EXP_RATIO } from "@providers/constants/SkillConstants";
import {
  GlovesBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  PotionsBlueprint,
  RangedBlueprint,
  SpearsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../abstractions/BaseNeutralNPC";

export const npcGhoul = {
  ...generateMoveTowardsMovement(),
  name: "Ghoul",
  key: HostileNPCsBlueprint.Ghoul,
  textureKey: HostileNPCsBlueprint.Ghoul,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Slow,
  canSwitchToRandomTarget: true,
  baseHealth: 97,
  healthRandomizerDice: Dice.D4,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 4,
    strength: {
      level: 4,
    },
    dexterity: {
      level: 1,
    },
    resistance: {
      level: 5,
    },
  },
  fleeOnLowHealth: false,
  experience: 16 * EXP_RATIO,
  loots: [
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: 10,
    },
    {
      itemBlueprintKey: PotionsBlueprint.GreaterLifePotion,
      chance: 20,
    },
    {
      itemBlueprintKey: PotionsBlueprint.ManaPotion,
      chance: 10,
    },
    {
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: 5,
    },
    {
      itemBlueprintKey: SwordsBlueprint.DoubleEdgedSword,
      chance: 15,
    },
    {
      itemBlueprintKey: GlovesBlueprint.StuddedGloves,
      chance: 20,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: 2.5,
    },
    {
      itemBlueprintKey: RangedBlueprint.Arrow,
      chance: 10,
      quantityRange: [10, 13],
    },
    {
      itemBlueprintKey: RangedBlueprint.Bolt,
      chance: 5,
      quantityRange: [10, 13],
    },
    {
      itemBlueprintKey: RangedBlueprint.Crossbow,
      chance: 4,
    },
  ],
} as Partial<INPC>;
