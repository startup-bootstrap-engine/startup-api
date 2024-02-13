import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  GemsBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
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

export const npcBlueDragon: INPCTierBlueprint<21> = {
  ...generateMoveTowardsMovement(),
  name: "Blue Dragon",
  key: HostileNPCsBlueprint.BlueDragon,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.BlueDragon,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.FireBall,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.ExtraFast,
  // @ts-ignore
  baseHealth: 50000,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  canSwitchToRandomTarget: true,
  isMagic: true,
  tier: 21,
  skills: {
    level: 358,
    strength: {
      level: 358,
    },
    dexterity: {
      level: 358,
    },
    resistance: {
      level: 358,
    },
    magicResistance: {
      level: 358,
    },
    magic: {
      level: 358,
    },
  },
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: 20,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonHead,
      chance: 100,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonTooth,
      chance: 80,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: 5,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: 20,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 20,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: 15,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: 10,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 30,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 30,
    },

    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: 5,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 30,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: 10,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.GlacialCrown,
      chance: 5,
    },
    {
      itemBlueprintKey: AxesBlueprint.GlacialAxe,
      chance: 5,
    },
    {
      itemBlueprintKey: LegsBlueprint.GlacialLegs,
      chance: 5,
    },
    {
      itemBlueprintKey: SwordsBlueprint.GlacialSword,
      chance: 5,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.EmeraldShield,
      chance: 1,
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: 5,
    },
    {
      itemBlueprintKey: MacesBlueprint.DragonScalCleaverClub,
      chance: 10,
    },
    {
      itemBlueprintKey: MacesBlueprint.ThunderStrikeClub,
      chance: 5,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 5,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: 8,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 5,
    },
    {
      itemBlueprintKey: AxesBlueprint.BoneReaperAxe,
      chance: 10,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 30,
    },
    {
      itemBlueprintKey: AxesBlueprint.IroncladCleaver,
      chance: 40,
    },
    {
      itemBlueprintKey: AxesBlueprint.MaulAxe,
      chance: 39,
    },
    {
      itemBlueprintKey: AxesBlueprint.ExecutionersAxe,
      chance: 42,
    },
    {
      itemBlueprintKey: DaggersBlueprint.FlameheartDagger,
      chance: 44,
    },
    {
      itemBlueprintKey: DaggersBlueprint.DarkmoonDagger,
      chance: 46,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 50,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ArrowheadDagger,
      chance: 51,
    },
    {
      itemBlueprintKey: GemsBlueprint.SapphireGem,
      chance: 1,
    },
    {
      itemBlueprintKey: GemsBlueprint.AmethystGem,
      chance: 1,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenRubyNecklace,
      chance: 3,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SunlitRubyNecklace,
      chance: 14,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.CrimsonNecklace,
      chance: 16,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SilverRing,
      chance: 17,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Freezing],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.FireStorm,
      probability: 40,
      power: MagicPower.Medium,
    },
    {
      spellKey: SpellsBlueprint.Blizzard,
      probability: 70,
      power: MagicPower.UltraHigh,
    },
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 40,
      power: MagicPower.High,
    },
  ],
};
