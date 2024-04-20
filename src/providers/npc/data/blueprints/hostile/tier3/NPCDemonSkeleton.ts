import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcDemonSkeleton: INPCTierBlueprint<3> = {
  ...generateMoveTowardsMovement(),
  name: "Demon Skeleton",
  key: HostileNPCsBlueprint.DemonSkeleton,
  subType: NPCSubtype.Undead,
  textureKey: HostileNPCsBlueprint.Skeleton,
  tintColor: 0xff0000,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Slow,
  tier: 3,
  baseHealth: 140,
  healthRandomizerDice: Dice.D4,
  skills: {
    level: 9,
    strength: {
      level: 10,
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
      itemBlueprintKey: ArmorsBlueprint.Jacket,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.Coat,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.LeatherJacket,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.Cap,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: BootsBlueprint.Boots,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Stone,
      chance: LootProbability.Uncommon,
      quantityRange: [2, 3],
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.EldensBow,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.IronNail,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Bone,
      chance: LootProbability.SemiCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Skull,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WaterBottle,
      chance: LootProbability.Common,
      quantityRange: [2, 3],
    },
  ],
};
