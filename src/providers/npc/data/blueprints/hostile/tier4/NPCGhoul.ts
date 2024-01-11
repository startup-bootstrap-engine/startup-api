import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  GlovesBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcGhoul: INPCTierBlueprint<4> = {
  ...generateMoveTowardsMovement(),
  name: "Ghoul",
  key: HostileNPCsBlueprint.Ghoul,
  subType: NPCSubtype.Undead,
  textureKey: HostileNPCsBlueprint.Ghoul,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Slow,
  canSwitchToRandomTarget: true,
  baseHealth: 180,
  tier: 4,
  healthRandomizerDice: Dice.D4,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 11,
    strength: {
      level: 12,
    },
    dexterity: {
      level: 12,
    },
    resistance: {
      level: 14,
    },
    magicResistance: {
      level: 14,
    },
  },
  loots: [
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: 10,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: 20,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Bandage,
      chance: 20,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Worm,
      chance: 50,
      quantityRange: [10, 15],
    },

    {
      itemBlueprintKey: DaggersBlueprint.RustedDagger,
      chance: 10,
    },
    {
      itemBlueprintKey: DaggersBlueprint.RustedJitte,
      chance: 10,
    },
    {
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: 5,
    },

    {
      itemBlueprintKey: GlovesBlueprint.StuddedGloves,
      chance: 20,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: 10,
      quantityRange: [10, 13],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bolt,
      chance: 5,
      quantityRange: [10, 13],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Crossbow,
      chance: 4,
    },
    {
      itemBlueprintKey: SwordsBlueprint.Sword,
      chance: 15,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Eye,
      chance: 15,
      quantityRange: [1, 3],
    },
  ],
};
