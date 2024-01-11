import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcBrownBear: INPCTierBlueprint<3> = {
  ...generateMoveTowardsMovement(),
  name: "Brown Bear",
  key: HostileNPCsBlueprint.BrownBear,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.BrownBear,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  baseHealth: 140,
  tier: 3,
  healthRandomizerDice: Dice.D6,
  canSwitchToRandomTarget: true,
  skills: {
    level: 8,
    strength: {
      level: 9,
    },
    dexterity: {
      level: 7,
    },
    resistance: {
      level: 10,
    },
    magicResistance: {
      level: 7,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.WildSalmon,
      chance: 30,
    },
    {
      itemBlueprintKey: FoodsBlueprint.BrownFish,
      chance: 10,
    },
    {
      itemBlueprintKey: FoodsBlueprint.RedMeat,
      chance: 30,
    },
    {
      itemBlueprintKey: FoodsBlueprint.RawBeefSteak,
      chance: 5,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Leather,
      chance: 50,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireNecklace,
      chance: 5,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
};
