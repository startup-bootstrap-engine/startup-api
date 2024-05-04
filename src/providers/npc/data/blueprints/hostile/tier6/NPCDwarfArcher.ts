import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  GemsBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
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
      chance: LootProbability.Common,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bolt,
      chance: LootProbability.Common,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Crossbow,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.GreenGrapeSeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: BootsBlueprint.StuddedBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.IronArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ToolsBlueprint.Pickaxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireRing,
      chance: LootProbability.VeryRare,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.SmallWoodenStick,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Shuriken,
      chance: LootProbability.Uncommon,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.SilverOre,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.WhisperWindBow,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.HeartseekerArrow,
      chance: LootProbability.VeryRare,
      quantityRange: [10, 20],
    },
    {
      itemBlueprintKey: GemsBlueprint.SapphireGem,
      chance: LootProbability.Uncommon,
    },
  ],
};
