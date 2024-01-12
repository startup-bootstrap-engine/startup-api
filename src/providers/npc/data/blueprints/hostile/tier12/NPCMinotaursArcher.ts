import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  RangedWeaponsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { MagicPower, NPCAlignment, NPCSubtype, RangeTypes, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcMinotaurArcher: INPCTierBlueprint<12> = {
  ...generateMoveTowardsMovement(),
  name: "Minotaur Archer",
  key: HostileNPCsBlueprint.MinotaurArcher,
  subType: NPCSubtype.Humanoid,
  textureKey: HostileNPCsBlueprint.MinotaurArcher,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: RangedWeaponsBlueprint.Arrow,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Fast,
  tier: 12,
  canSwitchToLowHealthTarget: true,
  baseHealth: 720,
  healthRandomizerDice: Dice.D8,
  skillRandomizerDice: Dice.D8,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 53,
    strength: {
      level: 53,
    },
    dexterity: {
      level: 53,
    },
    resistance: {
      level: 53,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: BootsBlueprint.RoyalBoots,
      chance: 3,
    },
    {
      itemBlueprintKey: DaggersBlueprint.IronJitte,
      chance: 10,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: 30,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.RoyalCrossbow,
      chance: 10,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.FireBolt,
      chance: 30,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: ArmorsBlueprint.BronzeArmor,
      chance: 20,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Jade,
      chance: 20,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Herb,
      chance: 20,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WaterBottle,
      chance: 20,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.EaglesEyeBow,
      chance: 3,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Burning],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.WildfireVolley,
      probability: 50,
      power: MagicPower.High,
    },
  ],
};
