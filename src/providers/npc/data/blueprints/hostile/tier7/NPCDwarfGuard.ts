import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  GemsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcDwarfGuard: INPCTierBlueprint<7> = {
  ...generateMoveTowardsMovement(),
  name: "Dwarf Guard",
  subType: NPCSubtype.Humanoid,
  key: HostileNPCsBlueprint.DwarfGuard,
  textureKey: HostileNPCsBlueprint.DwarfGuard,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  canSwitchToLowHealthTarget: true,
  baseHealth: 320,
  tier: 7,
  healthRandomizerDice: Dice.D4,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 26,
    strength: {
      level: 26,
    },
    dexterity: {
      level: 24,
    },
    resistance: {
      level: 26,
    },
    magicResistance: {
      level: 26,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: BootsBlueprint.Boots,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: ToolsBlueprint.FishingRod,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ToolsBlueprint.Pickaxe,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: BootsBlueprint.StuddedBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.AzureMachete,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.IronArmor,
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
      quantityRange: [7, 12],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SpearsBlueprint.Javelin,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DwarvenShield,
      chance: LootProbability.Uncommon,
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
      itemBlueprintKey: HammersBlueprint.WarHammer,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.InfantryHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: GemsBlueprint.TopazRadiance,
      chance: LootProbability.Uncommon,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
};
