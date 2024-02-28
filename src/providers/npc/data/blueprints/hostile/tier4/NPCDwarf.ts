import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  BootsBlueprint,
  GlovesBlueprint,
  MacesBlueprint,
  OthersBlueprint,
  RangedWeaponsBlueprint,
  SpearsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";

export const npcDwarf: INPCTierBlueprint<4> = {
  ...generateMoveTowardsMovement(),
  name: "Dwarf",
  key: HostileNPCsBlueprint.Dwarf,
  subType: NPCSubtype.Humanoid,
  textureKey: HostileNPCsBlueprint.Dwarf,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  canSwitchToRandomTarget: true,
  healthRandomizerDice: Dice.D6,
  tier: 4,
  baseHealth: 180,
  skills: {
    level: 14,
    strength: {
      level: 13,
    },
    dexterity: {
      level: 12,
    },
    resistance: {
      level: 13,
    },
    magicResistance: {
      level: 11,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: BootsBlueprint.Boots,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: ToolsBlueprint.Pickaxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ToolsBlueprint.FishingRod,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BootsBlueprint.StuddedBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: OthersBlueprint.Candle,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: GlovesBlueprint.StuddedGloves,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: LootProbability.Uncommon,
      quantityRange: [5, 10],
    },

    {
      itemBlueprintKey: AccessoriesBlueprint.IronRing,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SpearsBlueprint.StoneSpear,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: SwordsBlueprint.Sword,
      chance: LootProbability.Rare,
    },
  ],
};
