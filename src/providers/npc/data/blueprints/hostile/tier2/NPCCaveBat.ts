import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { CraftingResourcesBlueprint, FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";

export const npcCaveBat: INPCTierBlueprint<2> = {
  ...generateMoveTowardsMovement(),
  name: "Cave Bat",
  key: HostileNPCsBlueprint.CaveBat,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.CaveBat,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.ExtraFast,
  healthRandomizerDice: Dice.D4,
  tier: 2,
  baseHealth: 100,
  skills: {
    level: 6,
    strength: {
      level: 6,
    },
    dexterity: {
      level: 6,
    },
    resistance: {
      level: 6,
    },
  },
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.RedMeat,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BatsWing,
      chance: LootProbability.VeryCommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Worm,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Bones,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Coconut,
      chance: LootProbability.Uncommon,
    },
  ],
};
