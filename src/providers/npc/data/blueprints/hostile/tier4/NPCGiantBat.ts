import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  HelmetsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
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
      chance: 10,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Banana,
      chance: 30,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: FoodsBlueprint.Coconut,
      chance: 30,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: FoodsBlueprint.Watermelon,
      chance: 10,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BatsWing,
      chance: 50,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RoyalBracelet,
      chance: 15,
    },
  ],
};
