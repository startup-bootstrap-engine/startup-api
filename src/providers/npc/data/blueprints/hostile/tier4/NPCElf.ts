import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  OthersBlueprint,
  RangedWeaponsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { SpellAreaProbability } from "@providers/spells/area-spells/NPCSpellAreaTypes";
import { MagicPower, NPCAlignment, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcElf: INPCTierBlueprint<4> = {
  ...generateMoveTowardsMovement(),
  name: "Elf",
  key: HostileNPCsBlueprint.Elf,
  // @ts-ignore
  textureKey: "elf-white-hair-1",
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: RangedWeaponsBlueprint.Arrow,
  maxRangeAttack: 6,
  speed: MovementSpeed.Fast,
  tier: 4,
  baseHealth: 180,
  healthRandomizerDice: Dice.D12,
  canSwitchToRandomTarget: true,
  skills: {
    level: 11,
    strength: {
      level: 12,
    },
    dexterity: {
      level: 12,
    },
    resistance: {
      level: 11,
    },
    magicResistance: {
      level: 14,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: BootsBlueprint.StuddedBoots,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: OthersBlueprint.Candle,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.LeatherHelmet,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: ToolsBlueprint.FishingRod,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.LeatherLegs,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.ElvenSword,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.ShortSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.ElvenRing,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.AmazonsNecklace,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: LootProbability.Uncommon,
      quantityRange: [3, 10],
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.ElvenWood,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.ElvenLeaf,
      chance: LootProbability.Uncommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Wheat,
      chance: LootProbability.Uncommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.WoodenBoard,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Herb,
      chance: LootProbability.SemiCommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.WardenArrow,
      chance: LootProbability.VeryRare,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.CorruptionBow,
      chance: LootProbability.Rare,
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
