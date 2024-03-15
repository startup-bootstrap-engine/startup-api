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
  SeedsBlueprint,
  StaffsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
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
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: ToolsBlueprint.FishingRod,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.NinjaKunai,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.RedGrapeSeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: SeedsBlueprint.GreenGrapeSeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.IronArrow,
      chance: LootProbability.Uncommon,
      quantityRange: [3, 10],
    },
    {
      itemBlueprintKey: StaffsBlueprint.EnchantedStaff,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.ElvenWood,
      chance: LootProbability.SemiCommon,
      quantityRange: [10, 15],
    },
    {
      itemBlueprintKey: BootsBlueprint.IronBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueSapphire,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: LegsBlueprint.BronzeLegs,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: ArmorsBlueprint.BronzeArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.OrcishBow,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.SunflareArrow,
      chance: LootProbability.VeryRare,
      quantityRange: [10, 20],
    },
  ],
};
