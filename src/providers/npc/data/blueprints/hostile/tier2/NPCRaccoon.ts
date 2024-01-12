import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcRaccoon: INPCTierBlueprint<2> = {
  ...generateMoveTowardsMovement(),
  name: "Raccoon",
  key: HostileNPCsBlueprint.Raccoon,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.Raccoon,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  baseHealth: 100,
  tier: 2,
  healthRandomizerDice: Dice.D6,
  canSwitchToRandomTarget: true,
  skills: {
    level: 4.5,
    strength: {
      level: 4.5,
    },
    dexterity: {
      level: 5,
    },
    resistance: {
      level: 4.5,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.WildSalmon,
      chance: 20,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: FoodsBlueprint.Egg,
      chance: 10,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: FoodsBlueprint.Blueberry,
      chance: 30,
    },
    {
      itemBlueprintKey: SwordsBlueprint.ShortSword,
      chance: 20,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Leather,
      chance: 50,
      quantityRange: [1, 3],
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
};
