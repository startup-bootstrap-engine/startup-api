import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { CraftingResourcesBlueprint, FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";

export const npcBat: INPCTierBlueprint<1> = {
  ...generateMoveTowardsMovement(),
  name: "Bat",
  tier: 1,
  key: HostileNPCsBlueprint.Bat,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.Bat,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.ExtraFast,
  healthRandomizerDice: Dice.D4,
  baseHealth: 60,
  skills: {
    level: 3,
    strength: {
      level: 3,
    },
    dexterity: {
      level: 4,
    },
    resistance: {
      level: 2.5,
    },
  },
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.Banana,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BatsWing,
      chance: LootProbability.VeryCommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Eye,
      chance: LootProbability.Uncommon,
    },
  ],
};
