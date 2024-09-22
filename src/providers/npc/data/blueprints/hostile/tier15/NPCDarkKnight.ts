import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  OthersBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCCustomDeathPenalties, RangeTypes, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcDarkKnight: INPCTierBlueprint<15> = {
  ...generateMoveTowardsMovement(),
  name: "Dark Knight",
  key: HostileNPCsBlueprint.DarkKnight,
  tier: 15,
  // @ts-ignore
  textureKey: "superior-knight",
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  speed: MovementSpeed.ExtraFast,
  ammoKey: RangedWeaponsBlueprint.Bolt,
  maxRangeAttack: RangeTypes.High,
  baseHealth: 1320,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  skills: {
    level: 89,
    strength: {
      level: 98,
    },
    dexterity: {
      level: 98,
    },
    resistance: {
      level: 98,
    },
    magicResistance: {
      level: 98,
    },
  },
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.Cookie,
      chance: LootProbability.VeryCommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: ToolsBlueprint.MoonlureFishingRod,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SeedsBlueprint.PumpkinSeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 6],
    },
    {
      itemBlueprintKey: HelmetsBlueprint.BerserkersHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: OthersBlueprint.GoldCoin,
      chance: LootProbability.VeryCommon,
      quantityRange: [25, 75],
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Skull,
      chance: LootProbability.VeryCommon,
      quantityRange: [1, 10],
    },

    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: LootProbability.VeryRare,
    },

    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.HasteRing,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PhoenixFeather,
      chance: LootProbability.VeryCommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.ObsidiumOre,
      chance: LootProbability.SemiCommon,
      quantityRange: [5, 7],
    },
    {
      itemBlueprintKey: ArmorsBlueprint.KnightArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.CrownHelmet,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.CrownArmor,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: LegsBlueprint.BloodfireLegs,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.FalconsRing,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.CrimsonAegisShield,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.FalconsShield,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.FalconsSword,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SpearsBlueprint.CopperDoubleVoulge,
      chance: LootProbability.VeryRare,
    },

    {
      itemBlueprintKey: SpearsBlueprint.BohemianEarspoon,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: StaffsBlueprint.EagleEyeWand,
      chance: LootProbability.VeryRare,
    },

    {
      itemBlueprintKey: HammersBlueprint.ThorHammer,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.TempestTalonTautBow,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.TitanTetherTachiSword,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: LegsBlueprint.TerraformLegs,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.WoodsManAxe,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: ToolsBlueprint.EmeraldEclipsesPickaxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.ZephyrBlade,
      chance: LootProbability.VeryRare,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Freezing],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.Arrowstorm,
      probability: 10,
      power: MagicPower.Medium,
    },
    {
      spellKey: SpellsBlueprint.Blizzard,
      probability: 5,
      power: MagicPower.High,
    },
    {
      spellKey: SpellsBlueprint.SelfHealingSpell,
      probability: 20,
      power: MagicPower.Low,
    },
  ],
};
