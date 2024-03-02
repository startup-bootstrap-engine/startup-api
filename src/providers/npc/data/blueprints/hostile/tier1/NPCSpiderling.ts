import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";

export const npcSpiderling: INPCTierBlueprint<1> = {
  ...generateMoveTowardsMovement(),
  name: "Spiderling",
  subType: NPCSubtype.Insect,
  key: HostileNPCsBlueprint.Spiderling,
  textureKey: HostileNPCsBlueprint.Spiderling,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  baseHealth: 60,
  healthRandomizerDice: Dice.D4,
  tier: 1,
  skills: {
    level: 3,
    strength: {
      level: 3,
    },
    dexterity: {
      level: 4,
    },
    resistance: {
      level: 4,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: GlovesBlueprint.StuddedGloves,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Banana,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueSilk,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
  ],
};
