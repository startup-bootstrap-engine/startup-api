import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  CraftingResourcesBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
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
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.EggplantSeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: SwordsBlueprint.DoubleEdgedSword,
      chance: LootProbability.VeryRare,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bolt,
      chance: LootProbability.Uncommon,
      quantityRange: [10, 13],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.CompoundBow,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.FrostCrossbow,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.VikingShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueSilk,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueFeather,
      chance: LootProbability.Common,
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
