import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  BootsBlueprint,
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

export const npcCentipede: INPCTierBlueprint<2> = {
  ...generateMoveTowardsMovement(),
  name: "Centipede",
  key: HostileNPCsBlueprint.Centipede,
  subType: NPCSubtype.Insect,
  textureKey: HostileNPCsBlueprint.Centipede,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  baseHealth: 100,
  tier: 2,
  healthRandomizerDice: Dice.D6,
  canSwitchToRandomTarget: true,
  skills: {
    level: 5,
    strength: {
      level: 5,
    },
    dexterity: {
      level: 5,
    },
    resistance: {
      level: 5,
    },
  },
  fleeOnLowHealth: true,

  loots: [
    {
      itemBlueprintKey: BootsBlueprint.ReforcedBoots,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Bread,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.BananaBunch,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Apple,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: LootProbability.Uncommon,
      quantityRange: [3, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.MagicRecipe,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 5],
    },
  ],
};
