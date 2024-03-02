import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { CraftingResourcesBlueprint, FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";
import { INPCTierBlueprint } from "../../../types/npcTierTypes";

export const npcRat: INPCTierBlueprint<0> = {
  ...generateMoveTowardsMovement(),
  name: "Rat",
  key: HostileNPCsBlueprint.Rat,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.Rat,
  alignment: NPCAlignment.Hostile,
  tier: 0,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Slow,
  baseHealth: 20,
  healthRandomizerDice: Dice.D4,
  skills: {
    level: 0.5,
    strength: {
      level: 0.5,
    },
    dexterity: {
      level: 0.5,
    },
    resistance: {
      level: 0.5,
    },
  },
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.Cheese,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: FoodsBlueprint.CheeseSlice,
      chance: LootProbability.SemiCommon,
      quantityRange: [2, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Worm,
      chance: LootProbability.Uncommon,
      quantityRange: [5, 10],
    },
  ],
};
