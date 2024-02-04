import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
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

export const npcPurpleDragon: INPCTierBlueprint<23> = {
  ...generateMoveTowardsMovement(),
  name: "Purple Dragon",
  key: HostileNPCsBlueprint.PurpleDragon,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.PurpleDragon,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.FireBall,
  tier: 23,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.ExtraFast,
  // @ts-ignore
  baseHealth: 100000,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  canSwitchToRandomTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,

  isMagic: true,
  skills: {
    level: 498,
    strength: {
      level: 498,
    },
    dexterity: {
      level: 498,
    },
    resistance: {
      level: 498,
    },
    magicResistance: {
      level: 498,
    },
    magic: {
      level: 498,
    },
  },
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: 20,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonHead,
      chance: 100,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonTooth,
      chance: 100,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilJianSword,
      chance: 1,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 20,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: 20,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: 20,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.TemplarsPlate,
      chance: 10,
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
      itemBlueprintKey: SwordsBlueprint.YggdrasilTemplarSword,
      chance: 10,
    },
    {
      itemBlueprintKey: MacesBlueprint.SunderingClub,
      chance: 45,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 78,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 50,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 84,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: 40,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: 55,
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: 65,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: 65,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: 40,
    },
    {
      itemBlueprintKey: AxesBlueprint.WarAxe,
      chance: 50,
    },
    {
      itemBlueprintKey: AxesBlueprint.DanishAxe,
      chance: 60,
    },
    {
      itemBlueprintKey: AxesBlueprint.SpikedCleaverAxe,
      chance: 65,
    },
    {
      itemBlueprintKey: AxesBlueprint.TimberSplitterAxe,
      chance: 70,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 75,
    },
    {
      itemBlueprintKey: AxesBlueprint.BrutalChopperAxe,
      chance: 80,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 40,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 85,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: 85,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: 90,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Burning, EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Corruption],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 50,
      power: MagicPower.High,
    },
    {
      spellKey: SpellsBlueprint.CorruptionWave,
      probability: 70,
      power: MagicPower.UltraHigh,
    },
    {
      spellKey: SpellsBlueprint.FireStorm,
      probability: 40,
      power: MagicPower.Medium,
    },
  ],
};
