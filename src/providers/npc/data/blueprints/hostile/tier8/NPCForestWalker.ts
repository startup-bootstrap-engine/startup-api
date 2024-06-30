import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  BootsBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  GemsBlueprint,
  PotionsBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { SpellAreaProbability } from "@providers/spells/area-spells/NPCSpellAreaTypes";
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
  isGiantForm: true,
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
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SpikedShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.GreenGrapeSeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: SeedsBlueprint.CabbageSeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: LootProbability.VeryCommon,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: FoodsBlueprint.Salmon,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.VikingShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.FireBolt,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WoodenSticks,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.SmallWoodenStick,
      chance: LootProbability.Common,
      quantityRange: [5, 15],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WoodenBoard,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: LootProbability.Rare,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Herb,
      chance: LootProbability.VeryCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: SwordsBlueprint.EldensSword,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.EarthArrow,
      chance: LootProbability.VeryRare,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: BootsBlueprint.LeafstepBoots,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: GemsBlueprint.MistyQuartzGem,
      chance: LootProbability.Rare,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.NaturesRevenge,
      probability: 5,
      power: MagicPower.Low,
    },

    {
      spellKey: SpellsBlueprint.SelfHealingSpell,
      probability: SpellAreaProbability.Uncommon,
      power: MagicPower.Low,
    },
  ],
};
