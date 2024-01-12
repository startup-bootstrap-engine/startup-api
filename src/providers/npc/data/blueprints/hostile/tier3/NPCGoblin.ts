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
  ShieldsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
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
      chance: 20,
    },

    {
      itemBlueprintKey: ArmorsBlueprint.IronArmor,
      chance: 5,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: 10,
    },
    {
      itemBlueprintKey: FoodsBlueprint.RottenMeat,
      chance: 40,
      quantityRange: [5, 10],
    },

    {
      itemBlueprintKey: ToolsBlueprint.FishingRod,
      chance: 10,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Pineapple,
      chance: 10,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: FoodsBlueprint.BrownFish,
      chance: 10,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: FoodsBlueprint.BrownMushroom,
      chance: 10,
      quantityRange: [1, 2],
    },

    {
      itemBlueprintKey: HelmetsBlueprint.BrassHelmet,
      chance: 10,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.WoodenShield,
      chance: 10,
    },
    {
      itemBlueprintKey: AxesBlueprint.Bardiche,
      chance: 5,
    },
    {
      itemBlueprintKey: BootsBlueprint.Sandals,
      chance: 20,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.Stone,
      chance: 30,
      quantityRange: [5, 15],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.LongBow,
      chance: 5,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Rope,
      chance: 30,
    },

    {
      itemBlueprintKey: SwordsBlueprint.Saber,
      chance: 5,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PolishedStone,
      chance: 20,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Wheat,
      chance: 20,
      quantityRange: [5, 10],
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Rock,
      chance: 30,
      quantityRange: [1, 5],
    },
  ],
};
