import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { CraftingResourcesBlueprint, PotionsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcSnake: INPCTierBlueprint<1> = {
  ...generateMoveTowardsMovement(),
  name: "Snake",
  key: HostileNPCsBlueprint.Snake,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.Snake,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  baseHealth: 60,
  tier: 1,
  healthRandomizerDice: Dice.D6,
  canSwitchToRandomTarget: true,
  skills: {
    level: 3,
    strength: {
      level: 3,
    },
    dexterity: {
      level: 3,
    },
    resistance: {
      level: 3,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: PotionsBlueprint.LightAntidote,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueLeather,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Jade,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Herb,
      chance: LootProbability.SemiCommon,
      quantityRange: [5, 10],
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
};
