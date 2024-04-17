import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AxesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";

export const npcTrollWarrior: INPCTierBlueprint<14> = {
  ...generateMoveTowardsMovement(),
  name: "Troll Warrior",
  tier: 14,
  subType: NPCSubtype.Humanoid,
  key: HostileNPCsBlueprint.TrollWarrior,
  textureKey: HostileNPCsBlueprint.TrollWarrior,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  baseHealth: 1270,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 80,
    strength: {
      level: 80,
    },
    dexterity: {
      level: 77,
    },
    resistance: {
      level: 80,
    },
    magicResistance: {
      level: 80,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: MacesBlueprint.Mace,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.InfantryHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.ScutumShield,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.BrassHelmet,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bolt,
      chance: LootProbability.VeryCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bow,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.RoyalBow,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Salmon,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: StaffsBlueprint.PoisonStaff,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Shuriken,
      chance: LootProbability.Uncommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: AxesBlueprint.HandAxe,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.FlameheartDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.ElderHeartAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.AurumAlloyPickaxe,
      chance: LootProbability.SemiCommon,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CleavingStomp,
      probability: 50,
      power: MagicPower.High,
    },
  ],
};
