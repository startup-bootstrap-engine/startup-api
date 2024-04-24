import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  GlovesBlueprint,
  HelmetsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
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

export const npcAlphaWolf: INPCTierBlueprint<11> = {
  ...generateMoveTowardsMovement(),
  name: "Alpha Wolf",
  key: HostileNPCsBlueprint.AlphaWolf,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.AlphaWolf,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.Blue,
  tier: 11,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Fast,
  baseHealth: 670,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  canSwitchToRandomTarget: true,

  skills: {
    level: 41,
    strength: {
      level: 41,
    },
    dexterity: {
      level: 41,
    },
    resistance: {
      level: 41,
    },
    magicResistance: {
      level: 41,
    },
    magic: {
      level: 41,
    },
  },
  loots: [
    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.DoubleAxe,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: AxesBlueprint.GreatAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.IronHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.IronArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BootsBlueprint.SilverBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: GlovesBlueprint.ChainGloves,
      chance: LootProbability.Uncommon,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.BleedingEdge,
      probability: 10,
      power: MagicPower.High,
    },
    {
      spellKey: SpellsBlueprint.CleavingStomp,
      probability: 50,
      power: MagicPower.High,
    },
  ],
};
