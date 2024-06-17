import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  CraftingResourcesBlueprint,
  PotionsBlueprint,
  RangedWeaponsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { SpellAreaProbability } from "@providers/spells/area-spells/NPCSpellAreaTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcGhost: INPCTierBlueprint<3> = {
  ...generateMoveTowardsMovement(),
  name: "Ghost",
  key: HostileNPCsBlueprint.Ghost,
  subType: NPCSubtype.Magical,
  textureKey: HostileNPCsBlueprint.Ghost,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  canSwitchToRandomTarget: true,
  tier: 3,
  baseHealth: 140,
  healthRandomizerDice: Dice.D4,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 7,
    strength: {
      level: 7,
    },
    dexterity: {
      level: 7,
    },
    resistance: {
      level: 7,
    },
    magicResistance: {
      level: 7,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: LootProbability.Uncommon,
      quantityRange: [3, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Bandage,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bolt,
      chance: LootProbability.Uncommon,
      quantityRange: [3, 10],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bow,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Crossbow,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: LootProbability.SemiCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: PotionsBlueprint.LightLifePotion,
      chance: LootProbability.Uncommon,
    },
  ],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.SelfHealingSpell,
      probability: SpellAreaProbability.Common,
      power: MagicPower.Low,
    },
  ],
};
