import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  ContainersBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  GemsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, RangeTypes, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcOrcRaider: INPCTierBlueprint<12> = {
  ...generateMoveTowardsMovement(),
  name: "Orc Raider",
  subType: NPCSubtype.Humanoid,
  key: HostileNPCsBlueprint.OrcRaider,
  textureKey: HostileNPCsBlueprint.OrcRaider,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: RangedWeaponsBlueprint.Arrow,
  speed: MovementSpeed.ExtraFast,
  maxRangeAttack: RangeTypes.High,
  tier: 12,
  baseHealth: 820,
  healthRandomizerDice: Dice.D6,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity"],
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  skills: {
    level: 59,
    strength: {
      level: 53,
    },
    dexterity: {
      level: 62,
    },
    resistance: {
      level: 62,
    },
    magicResistance: {
      level: 62,
    },
  },
  loots: [
    {
      itemBlueprintKey: CraftingResourcesBlueprint.GreenOre,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: SeedsBlueprint.TurnipSeed,
      chance: LootProbability.Common,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.OrcRing,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
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
      itemBlueprintKey: StaffsBlueprint.AirWand,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: DaggersBlueprint.RomanDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.JianSword,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ContainersBlueprint.Backpack,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.PlateArmor,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AxesBlueprint.HammerCleaveAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AxesBlueprint.RoyalChopperAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.LogSplitterAxe,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: GemsBlueprint.ObsidianGem,
      chance: LootProbability.Common,
    },
  ],
  entityEffects: [EntityEffectBlueprint.VineGrasp],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.VineGrasp,
      probability: 50,
      power: MagicPower.High,
    },
  ],
};
