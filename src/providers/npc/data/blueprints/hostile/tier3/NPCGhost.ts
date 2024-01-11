import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { CraftingResourcesBlueprint, RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
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
      chance: 20,
      quantityRange: [3, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Bandage,
      chance: 20,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: 20,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bolt,
      chance: 20,
      quantityRange: [3, 10],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bow,
      chance: 20,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Crossbow,
      chance: 20,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: 30,
      quantityRange: [5, 10],
    },
  ],
};
