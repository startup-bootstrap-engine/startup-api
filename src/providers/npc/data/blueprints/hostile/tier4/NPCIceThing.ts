import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  HelmetsBlueprint,
  OthersBlueprint,
  RangedWeaponsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcIceThing: INPCTierBlueprint<4> = {
  ...generateMoveTowardsMovement(),
  name: "Ice Thing",
  key: HostileNPCsBlueprint.IceThing,
  subType: NPCSubtype.Elemental,
  textureKey: HostileNPCsBlueprint.IceThing,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: RangedWeaponsBlueprint.FrostBow,
  isMagic: true,
  maxRangeAttack: 6,
  tier: 4,
  speed: MovementSpeed.Standard,
  baseHealth: 180,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  skills: {
    level: 12,
    strength: {
      level: 11,
    },
    dexterity: {
      level: 12,
    },
    resistance: {
      level: 12,
    },
    magicResistance: {
      level: 12,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.RottenMeat,
      chance: LootProbability.Uncommon,
      quantityRange: [5, 10],
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
      itemBlueprintKey: HelmetsBlueprint.WingHelmet,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.IceSword,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Rope,
      chance: LootProbability.SemiCommon,
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
      itemBlueprintKey: CraftingResourcesBlueprint.PhoenixFeather,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Rock,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.MagicRecipe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: OthersBlueprint.GoldCoin,
      chance: LootProbability.Common,
      quantityRange: [10, 30],
    },
  ],
};
