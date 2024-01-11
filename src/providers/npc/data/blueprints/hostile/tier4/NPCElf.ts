import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  OthersBlueprint,
  RangedWeaponsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcElf: INPCTierBlueprint<4> = {
  ...generateMoveTowardsMovement(),
  name: "Elf",
  key: HostileNPCsBlueprint.Elf,
  // @ts-ignore
  textureKey: "elf-white-hair-1",
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: RangedWeaponsBlueprint.Arrow,
  maxRangeAttack: 6,
  speed: MovementSpeed.Fast,
  tier: 4,
  baseHealth: 180,
  healthRandomizerDice: Dice.D12,
  canSwitchToRandomTarget: true,
  skills: {
    level: 11,
    strength: {
      level: 12,
    },
    dexterity: {
      level: 12,
    },
    resistance: {
      level: 11,
    },
    magicResistance: {
      level: 14,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: BootsBlueprint.StuddedBoots,
      chance: 30,
    },
    {
      itemBlueprintKey: OthersBlueprint.Candle,
      chance: 10,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.LeatherHelmet,
      chance: 30,
    },

    {
      itemBlueprintKey: ToolsBlueprint.FishingRod,
      chance: 10,
    },
    {
      itemBlueprintKey: LegsBlueprint.LeatherLegs,
      chance: 15,
    },
    {
      itemBlueprintKey: SwordsBlueprint.ElvenSword,
      chance: 2.5,
    },
    {
      itemBlueprintKey: SwordsBlueprint.ShortSword,
      chance: 20,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.ElvenRing,
      chance: 1,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.AmazonsNecklace,
      chance: 3,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: 20,
      quantityRange: [3, 10],
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.ElvenWood,
      chance: 20,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.ElvenLeaf,
      chance: 20,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Wheat,
      chance: 10,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WoodenBoard,
      chance: 10,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Herb,
      chance: 30,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.WardenArrow,
      chance: 3,
      quantityRange: [10, 20],
    },
  ],
};
