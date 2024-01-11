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
      chance: 30,
    },
    {
      itemBlueprintKey: ToolsBlueprint.Pickaxe,
      chance: 10,
    },
    {
      itemBlueprintKey: ToolsBlueprint.FishingRod,
      chance: 10,
    },
    {
      itemBlueprintKey: BootsBlueprint.StuddedBoots,
      chance: 15,
    },
    {
      itemBlueprintKey: OthersBlueprint.Candle,
      chance: 10,
    },
    {
      itemBlueprintKey: GlovesBlueprint.StuddedGloves,
      chance: 15,
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: 10,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: 20,
      quantityRange: [5, 10],
    },

    {
      itemBlueprintKey: AccessoriesBlueprint.IronRing,
      chance: 10,
    },
    {
      itemBlueprintKey: SpearsBlueprint.StoneSpear,
      chance: 5,
    },

    {
      itemBlueprintKey: SwordsBlueprint.Sword,
      chance: 5,
    },
  ],
};
