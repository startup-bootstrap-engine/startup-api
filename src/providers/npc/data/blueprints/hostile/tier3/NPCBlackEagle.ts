import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  RangedWeaponsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";

export const npcBlackEagle: INPCTierBlueprint<3> = {
  ...generateMoveTowardsMovement(),
  name: "Black Eagle",
  key: HostileNPCsBlueprint.BlackEagle,
  subType: NPCSubtype.Bird,
  textureKey: HostileNPCsBlueprint.BlackEagle,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.ExtraFast,
  baseHealth: 140,
  healthRandomizerDice: Dice.D12,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  tier: 3,
  skills: {
    level: 7,
    strength: {
      level: 7,
    },
    dexterity: {
      level: 8,
    },
    resistance: {
      level: 7,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Stone,
      chance: LootProbability.SemiCommon,
      quantityRange: [5, 15],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Worm,
      chance: LootProbability.VeryCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.ColoredFeather,
      chance: LootProbability.Rare,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Feather,
      chance: LootProbability.SemiCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.HorseBow,
      chance: LootProbability.Rare,
    },
  ],
};
