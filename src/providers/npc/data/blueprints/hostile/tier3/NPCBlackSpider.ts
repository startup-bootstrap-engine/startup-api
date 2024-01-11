import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  DaggersBlueprint,
  FoodsBlueprint,
  HelmetsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcBlackSpider: INPCTierBlueprint<3> = {
  ...generateMoveTowardsMovement(),
  name: "Black Spider",
  key: HostileNPCsBlueprint.BlackSpider,
  subType: NPCSubtype.Insect,
  textureKey: HostileNPCsBlueprint.BlackSpider,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  tier: 3,
  baseHealth: 140,
  healthRandomizerDice: Dice.D6,
  skills: {
    level: 7,
    strength: {
      level: 7,
    },
    dexterity: {
      level: 10,
    },
    resistance: {
      level: 7,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: HelmetsBlueprint.WizardHat,
      chance: 10,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: 30,
    },
    {
      itemBlueprintKey: SwordsBlueprint.ShortSword,
      chance: 20,
    },
    {
      itemBlueprintKey: DaggersBlueprint.SaiDagger,
      chance: 5,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
};
