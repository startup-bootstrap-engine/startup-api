import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  PotionsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { FriendlyNPCsBlueprint, HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { SpellAreaProbability } from "@providers/spells/area-spells/NPCSpellAreaTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcBandit: INPCTierBlueprint<4> = {
  ...generateMoveTowardsMovement(),
  name: "Bandit",
  subType: NPCSubtype.Humanoid,
  key: HostileNPCsBlueprint.Bandit,
  textureKey: FriendlyNPCsBlueprint.MaleNobleBlackHair,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  baseHealth: 190,
  tier: 4,
  healthRandomizerDice: Dice.D6,
  canSwitchToRandomTarget: true,
  skills: {
    level: 12,
    strength: {
      level: 11,
    },
    dexterity: {
      level: 14,
    },
    resistance: {
      level: 11,
    },
    magicResistance: {
      level: 11,
    },
  },
  fleeOnLowHealth: true,

  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.BroadSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Milk,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.AmuletOfLuck,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SeedsBlueprint.StrawberrySeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: GlovesBlueprint.StuddedGloves,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.LeatherHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RedHoodie,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.BanditShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.Turban,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.LeatherLegs,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.Bardiche,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AxesBlueprint.Halberd,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: LootProbability.SemiCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.Bandana,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: BootsBlueprint.SteelBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: PotionsBlueprint.LightLifePotion,
      chance: LootProbability.Uncommon,
    },
  ],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.SelfHealingSpell,
      probability: SpellAreaProbability.VeryRare,
      power: MagicPower.Low,
    },
  ],
};
