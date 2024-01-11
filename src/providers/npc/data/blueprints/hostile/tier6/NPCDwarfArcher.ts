import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  RangedWeaponsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype, RangeTypes } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcDwarfArcher: INPCTierBlueprint<6> = {
  ...generateMoveTowardsMovement(),
  name: "Dwarf Archer",
  key: HostileNPCsBlueprint.DwarfArcher,
  subType: NPCSubtype.Humanoid,
  textureKey: HostileNPCsBlueprint.DwarfArcher,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: RangedWeaponsBlueprint.Arrow,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Fast,
  baseHealth: 280,
  tier: 6,
  healthRandomizerDice: Dice.D12,
  canSwitchToRandomTarget: true,
  skills: {
    level: 20,
    strength: {
      level: 20,
    },
    dexterity: {
      level: 20,
    },
    resistance: {
      level: 19,
    },
    magicResistance: {
      level: 19,
    },
    distance: {
      level: 20,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: 40,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bolt,
      chance: 40,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Crossbow,
      chance: 20,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: 5,
    },

    {
      itemBlueprintKey: BootsBlueprint.StuddedBoots,
      chance: 15,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.IronArmor,
      chance: 20,
    },
    {
      itemBlueprintKey: ToolsBlueprint.Pickaxe,
      chance: 10,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireRing,
      chance: 1,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.SmallWoodenStick,
      chance: 20,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Shuriken,
      chance: 10,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.SilverOre,
      chance: 7,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.WhisperWindBow,
      chance: 1,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.HeartseekerArrow,
      chance: 3,
      quantityRange: [10, 20],
    },
  ],
};
