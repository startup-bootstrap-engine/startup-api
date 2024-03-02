import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { CraftingResourcesBlueprint, FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";

export const npcPandaBear: INPCTierBlueprint<5> = {
  ...generateMoveTowardsMovement(),
  name: "Panda Bear",
  key: HostileNPCsBlueprint.PandaBear,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.PandaBear,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Slow,
  baseHealth: 220,
  tier: 5,
  healthRandomizerDice: Dice.D6,
  canSwitchToRandomTarget: true,
  skills: {
    level: 17,
    strength: {
      level: 17,
    },
    dexterity: {
      level: 17,
    },
    resistance: {
      level: 17,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Salmon,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.RawBeefSteak,
      chance: LootProbability.Rare,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: FoodsBlueprint.Banana,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Leather,
      chance: LootProbability.VeryCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: FoodsBlueprint.IceMushroom,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 2],
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
};
