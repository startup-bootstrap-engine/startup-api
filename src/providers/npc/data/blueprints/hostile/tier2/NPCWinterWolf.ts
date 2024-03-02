import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { CraftingResourcesBlueprint, FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";

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
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Bread,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.WolfTooth,
      chance: LootProbability.VeryCommon,
      quantityRange: [3, 5],
    },
  ],
};
