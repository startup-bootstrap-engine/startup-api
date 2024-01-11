import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcWolf: INPCTierBlueprint<1> = {
  ...generateMoveTowardsMovement(),
  name: "Wolf",
  tier: 1,
  key: HostileNPCsBlueprint.Wolf,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.Wolf,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  baseHealth: 60,
  healthRandomizerDice: Dice.D4,
  skills: {
    level: 4,
    strength: {
      level: 4,
    },
    dexterity: {
      level: 4,
    },
    resistance: {
      level: 2.5,
    },
    magicResistance: {
      level: 2.5,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.Salmon,
      chance: 20,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Bread,
      chance: 30,
    },
    {
      itemBlueprintKey: DaggersBlueprint.Dagger,
      chance: 30,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.WolfToothChain,
      chance: 10,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WolfTooth,
      chance: 50,
      quantityRange: [1, 2],
    },
  ],
};
