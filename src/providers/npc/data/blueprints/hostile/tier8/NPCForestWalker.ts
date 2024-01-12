import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  BootsBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  PotionsBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import {
  AnimationEffectKeys,
  MagicPower,
  NPCAlignment,
  NPCSubtype,
  RangeTypes,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcForestWalker: INPCTierBlueprint<8> = {
  ...generateMoveTowardsMovement(),
  name: "Forest Walker",
  key: HostileNPCsBlueprint.ForestWalker,
  subType: NPCSubtype.Elemental,
  textureKey: HostileNPCsBlueprint.ForestWalker,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.Green,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Slow,
  baseHealth: 390,
  tier: 8,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 30,
    strength: {
      level: 30,
    },
    dexterity: {
      level: 30,
    },
    resistance: {
      level: 29,
    },
  },
  fleeOnLowHealth: true,

  loots: [
    {
      itemBlueprintKey: PotionsBlueprint.LightLifePotion,
      chance: 30,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SpikedShield,
      chance: 20,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: 50,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: FoodsBlueprint.Salmon,
      chance: 30,
    },

    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: 15,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.VikingShield,
      chance: 10,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.FireBolt,
      chance: 5,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WoodenSticks,
      chance: 30,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.SmallWoodenStick,
      chance: 40,
      quantityRange: [5, 15],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WoodenBoard,
      chance: 30,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: 5,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Herb,
      chance: 50,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: SwordsBlueprint.EldensSword,
      chance: 1,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.EarthArrow,
      chance: 3,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: BootsBlueprint.LeafstepBoots,
      chance: 5,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.NaturesRevenge,
      probability: 5,
      power: MagicPower.Low,
    },
  ],
};
