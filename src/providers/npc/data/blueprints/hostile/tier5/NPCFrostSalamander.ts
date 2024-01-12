import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  CraftingResourcesBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcFrostSalamander: INPCTierBlueprint<5> = {
  ...generateMoveTowardsMovement(),
  name: "Frost Salamander",
  key: HostileNPCsBlueprint.FrostSalamander,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.FrostSalamander,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  baseHealth: 220,
  tier: 5,
  healthRandomizerDice: Dice.D12,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 15,
    strength: {
      level: 15,
    },
    dexterity: {
      level: 15,
    },
    resistance: {
      level: 15,
    },
    magicResistance: {
      level: 15,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.IceSword,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.DoubleEdgedSword,
      chance: 1,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bolt,
      chance: 20,
      quantityRange: [10, 13],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.CompoundBow,
      chance: 5,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.FrostCrossbow,
      chance: 5,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.VikingShield,
      chance: 10,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueSilk,
      chance: 20,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueFeather,
      chance: 40,
      quantityRange: [3, 5],
    },
  ],
  entityEffects: [EntityEffectBlueprint.Freezing],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.Blizzard,
      probability: 5,
      power: MagicPower.High,
    },
  ],
};
