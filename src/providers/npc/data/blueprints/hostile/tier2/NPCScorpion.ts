import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  FoodsBlueprint,
  PotionsBlueprint,
  RangedWeaponsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";

export const npcScorpion: INPCTierBlueprint<2> = {
  ...generateMoveTowardsMovement(),
  name: "Scorpion",
  key: HostileNPCsBlueprint.Scorpion,
  subType: NPCSubtype.Insect,
  textureKey: HostileNPCsBlueprint.Scorpion,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  baseHealth: 100,
  tier: 2,
  healthRandomizerDice: Dice.D6,
  canSwitchToRandomTarget: true,
  skills: {
    level: 6,
    strength: {
      level: 4.5,
    },
    dexterity: {
      level: 4.5,
    },
    resistance: {
      level: 4.5,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: PotionsBlueprint.LightAntidote,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Potato,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Shuriken,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
};
