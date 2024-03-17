import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  HelmetsBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcGoblin: INPCTierBlueprint<3> = {
  ...generateMoveTowardsMovement(),
  name: "Goblin",
  subType: NPCSubtype.Humanoid,
  key: HostileNPCsBlueprint.Goblin,
  textureKey: HostileNPCsBlueprint.Goblin,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: RangedWeaponsBlueprint.Stone,
  maxRangeAttack: 6,
  speed: MovementSpeed.Fast,
  baseHealth: 140,

  healthRandomizerDice: Dice.D12,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  tier: 3,
  skills: {
    level: 10,
    strength: {
      level: 10,
    },
    dexterity: {
      level: 8,
    },
    resistance: {
      level: 8,
    },
    magicResistance: {
      level: 8,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.ShortSword,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: ArmorsBlueprint.IronArmor,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.StrawberrySeed,
      chance: LootProbability.Common,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: SeedsBlueprint.CabbageSeed,
      chance: LootProbability.Common,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: SeedsBlueprint.GreenGrapeSeed,
      chance: LootProbability.Common,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: SeedsBlueprint.CarrotSeed,
      chance: LootProbability.Common,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: FoodsBlueprint.RottenMeat,
      chance: LootProbability.Common,
      quantityRange: [5, 10],
    },

    {
      itemBlueprintKey: ToolsBlueprint.FishingRod,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Pineapple,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: FoodsBlueprint.BrownFish,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: FoodsBlueprint.BrownMushroom,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 2],
    },

    {
      itemBlueprintKey: HelmetsBlueprint.BrassHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.WoodenShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.Bardiche,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BootsBlueprint.Sandals,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.Stone,
      chance: LootProbability.SemiCommon,
      quantityRange: [5, 15],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.LongBow,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Rope,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: SwordsBlueprint.Saber,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PolishedStone,
      chance: LootProbability.Uncommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Wheat,
      chance: LootProbability.Uncommon,
      quantityRange: [5, 10],
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Rock,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 5],
    },
  ],
};
