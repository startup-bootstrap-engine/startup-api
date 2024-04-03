import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  HelmetsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcGiantBat: INPCTierBlueprint<4> = {
  ...generateMoveTowardsMovement(),
  name: "Giant Bat",
  key: HostileNPCsBlueprint.GiantBat,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.GiantBat,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  tier: 4,
  isGiantForm: true,
  baseHealth: 180,
  healthRandomizerDice: Dice.D6,
  canSwitchToRandomTarget: true,
  skills: {
    level: 11,
    strength: {
      level: 12,
    },
    dexterity: {
      level: 11,
    },
    resistance: {
      level: 11,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: HelmetsBlueprint.DeathsHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Banana,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: FoodsBlueprint.Coconut,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: FoodsBlueprint.Watermelon,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BatsWing,
      chance: LootProbability.VeryCommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RoyalBracelet,
      chance: LootProbability.Uncommon,
    },
  ],
};
