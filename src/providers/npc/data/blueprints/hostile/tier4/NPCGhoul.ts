import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  GlovesBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
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
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.RedGrapeSeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Bandage,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Worm,
      chance: LootProbability.VeryCommon,
      quantityRange: [10, 15],
    },

    {
      itemBlueprintKey: DaggersBlueprint.RustedDagger,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.RustedJitte,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: GlovesBlueprint.StuddedGloves,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: LootProbability.Uncommon,
      quantityRange: [10, 13],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bolt,
      chance: LootProbability.Rare,
      quantityRange: [10, 13],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Crossbow,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.Sword,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Eye,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
    },
  ],
};
