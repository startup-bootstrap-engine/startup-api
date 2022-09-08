import { INPC } from "@entities/ModuleNPC/NPCModel";
import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EXP_RATIO } from "@providers/constants/SkillConstants";

import { HostileNPCsBlueprint } from "@providers/item/data/types/npcsBlueprintTypes";
import { NPCAlignment } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../abstractions/BaseNeutralNPC";

import {
  BowsBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  MacesBlueprint,
  PotionsBlueprint,
  SpearsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";

export const npcWildTroll = {
  ...generateMoveTowardsMovement(),
  name: "Wild Troll",
  key: HostileNPCsBlueprint.WildTroll,
  textureKey: HostileNPCsBlueprint.WildTroll,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Slow,
  baseHealth: 230,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skills: {
    level: 18,
    strength: {
      level: 18,
    },
    dexterity: {
      level: 5,
    },
  },
  fleeOnLowHealth: true,
  experience: 160 * EXP_RATIO,
  loots: [
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: 25,
    },
    {
      itemBlueprintKey: GlovesBlueprint.StuddedGloves,
      chance: 10,
    },
    {
      itemBlueprintKey: PotionsBlueprint.GreaterLifePotion,
      chance: 30,
    },
    {
      itemBlueprintKey: BowsBlueprint.Bolt,
      chance: 50,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: SpearsBlueprint.Spear,
      chance: 20,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Salmon,
      chance: 30,
    },
  ],
} as Partial<INPC>;