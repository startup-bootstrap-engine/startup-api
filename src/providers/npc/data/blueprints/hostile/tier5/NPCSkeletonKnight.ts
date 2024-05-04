import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  GemsBlueprint,
  HelmetsBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcSkeletonKnight: INPCTierBlueprint<5> = {
  ...generateMoveTowardsMovement(),
  name: "Skeleton Knight",
  key: HostileNPCsBlueprint.SkeletonKnight,
  subType: NPCSubtype.Undead,
  textureKey: HostileNPCsBlueprint.SkeletonKnight,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  baseHealth: 220,
  tier: 5,
  healthRandomizerDice: Dice.D4,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  skills: {
    level: 15,
    strength: {
      level: 17,
    },
    dexterity: {
      level: 15,
    },
    resistance: {
      level: 18,
    },
    magicResistance: {
      level: 18,
    },
  },
  loots: [
    {
      itemBlueprintKey: ArmorsBlueprint.StuddedArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.StrawberrySeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueSapphire,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.StuddedShield,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: HelmetsBlueprint.IronHelmet,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BootsBlueprint.StuddedBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.KnightsShield,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bow,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.ElvenBolt,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Bone,
      chance: LootProbability.VeryCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Skull,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: SwordsBlueprint.CopperveinBlade,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: GemsBlueprint.EmeraldGem,
      chance: LootProbability.Common,
    },
  ],
};
