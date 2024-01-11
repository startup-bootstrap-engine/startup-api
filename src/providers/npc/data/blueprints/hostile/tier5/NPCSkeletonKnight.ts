import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  HelmetsBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
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
      chance: 25,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueSapphire,
      chance: 30,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.StuddedShield,
      chance: 30,
    },

    {
      itemBlueprintKey: HelmetsBlueprint.IronHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: BootsBlueprint.StuddedBoots,
      chance: 25,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.KnightsShield,
      chance: 5,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bow,
      chance: 10,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.ElvenBolt,
      chance: 5,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Bone,
      chance: 50,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Skull,
      chance: 25,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: SwordsBlueprint.CopperveinBlade,
      chance: 2,
    },
  ],
};
