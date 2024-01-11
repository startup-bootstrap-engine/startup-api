import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { CraftingResourcesBlueprint, FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcWinterWolf: INPCTierBlueprint<2> = {
  ...generateMoveTowardsMovement(),
  name: "Winter Wolf",
  key: HostileNPCsBlueprint.WinterWolf,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.WinterWolf,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  baseHealth: 100,
  healthRandomizerDice: Dice.D4,
  tier: 2,
  skills: {
    level: 4.5,
    strength: {
      level: 4.5,
    },
    dexterity: {
      level: 6,
    },
    resistance: {
      level: 4.5,
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
      itemBlueprintKey: CraftingResourcesBlueprint.WolfTooth,
      chance: 50,
      quantityRange: [3, 5],
    },
  ],
};
