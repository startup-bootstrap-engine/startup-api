import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  RangedWeaponsBlueprint,
  StaffsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcOrcArcher: INPCTierBlueprint<6> = {
  ...generateMoveTowardsMovement(),
  name: "Orc Archer",
  subType: NPCSubtype.Humanoid,
  key: HostileNPCsBlueprint.OrcArcher,
  textureKey: HostileNPCsBlueprint.OrcArcher,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: RangedWeaponsBlueprint.Arrow,
  maxRangeAttack: 6,
  speed: MovementSpeed.Fast,
  tier: 6,
  baseHealth: 280,
  healthRandomizerDice: Dice.D12,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D12,
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
      itemBlueprintKey: HelmetsBlueprint.LeatherHelmet,
      chance: 30,
    },

    {
      itemBlueprintKey: ToolsBlueprint.FishingRod,
      chance: 10,
    },
    {
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: 15,
    },
    {
      itemBlueprintKey: DaggersBlueprint.NinjaKunai,
      chance: 15,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.IronArrow,
      chance: 20,
      quantityRange: [3, 10],
    },
    {
      itemBlueprintKey: StaffsBlueprint.EnchantedStaff,
      chance: 5,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.ElvenWood,
      chance: 30,
      quantityRange: [10, 15],
    },
    {
      itemBlueprintKey: BootsBlueprint.IronBoots,
      chance: 10,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueSapphire,
      chance: 30,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: LegsBlueprint.BronzeLegs,
      chance: 2,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: 30,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: ArmorsBlueprint.BronzeArmor,
      chance: 10,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.OrcishBow,
      chance: 40,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.SunflareArrow,
      chance: 2,
      quantityRange: [10, 20],
    },
  ],
};
