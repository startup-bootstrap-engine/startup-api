import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  AxesBlueprint,
  BooksBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  GemsBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import {
  AnimationEffectKeys,
  MagicPower,
  NPCAlignment,
  NPCCustomDeathPenalties,
  NPCSubtype,
  RangeTypes,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcYellowDragon: INPCTierBlueprint<22> = {
  ...generateMoveTowardsMovement(),
  name: "Yellow Dragon",
  key: HostileNPCsBlueprint.YellowDragon,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.YellowDragon,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.FireBall,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  isGiantForm: true,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.ExtraFast,
  // @ts-ignore
  baseHealth: 70000,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  canSwitchToRandomTarget: true,
  isMagic: true,
  tier: 22,
  skills: {
    level: 418,
    strength: {
      level: 418,
    },
    dexterity: {
      level: 418,
    },
    resistance: {
      level: 418,
    },
    magicResistance: {
      level: 418,
    },
    magic: {
      level: 418,
    },
  },
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysteryOrb,
      chance: LootProbability.VeryRare,
    },

    {
      itemBlueprintKey: HammersBlueprint.StarlightHammer,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PrimordialRelic,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: ToolsBlueprint.GildedLavaPickaxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: StaffsBlueprint.MysticLightningStaff,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalSphere,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonHead,
      chance: LootProbability.VeryCommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonTooth,
      chance: LootProbability.VeryCommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.DragonScalCleaverClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.ThunderStrikeClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalStoneScepter,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: LootProbability.SemiCommon,
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
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.BattleAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.HammerCleaveAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ArrowheadDagger,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: LootProbability.Common,
    },
    {
      itemBlueprintKey: GemsBlueprint.RubyGem,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: GemsBlueprint.CoralReefGem,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: GemsBlueprint.TopazRadiance,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: GemsBlueprint.ObsidianGem,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EmberStrandNecklace,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GarnetNecklace,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EmberglowNecklace,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EmeraldRing,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.CherryRing,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalCodex,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.ElementalGrimoire,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.ArcaneArchives,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BooksBlueprint.EnigmaScrolls,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.ArcaneAdepthat,
      chance: LootProbability.Uncommon,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Burning],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.FireStorm,
      probability: 40,
      power: MagicPower.UltraHigh,
    },
    {
      spellKey: SpellsBlueprint.EnergyWave,
      probability: 70,
      power: MagicPower.UltraHigh,
    },
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 40,
      power: MagicPower.Medium,
    },
    {
      spellKey: SpellsBlueprint.SelfHealingSpell,
      probability: 30,
      power: MagicPower.High,
    },
  ],
};
