import { INPC } from "@entities/ModuleNPC/NPCModel";
import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import {
  AnimationEffectKeys,
  MagicPower,
  NPCAlignment,
  NPCCustomDeathPenalties,
  NPCSubtype,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../abstractions/BaseNeutralNPC";

export const npcBlueDragon = {
  ...generateMoveTowardsMovement(),
  name: "Blue Dragon",
  key: HostileNPCsBlueprint.BlueDragon,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.BlueDragon,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.FireBall,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  maxRangeAttack: 8,
  speed: MovementSpeed.ExtraFast,
  baseHealth: 50000,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  canSwitchToRandomTarget: true,
  isMagic: true,
  skills: {
    level: 350,
    strength: {
      level: 300,
    },
    dexterity: {
      level: 250,
    },
    resistance: {
      level: 250,
    },
    magicResistance: {
      level: 250,
    },
    magic: {
      level: 250,
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
      chance: 30,
    },
    {
      itemBlueprintKey: MacesBlueprint.DragonScalCleaverClub,
      chance: 40,
    },
    {
      itemBlueprintKey: MacesBlueprint.ThunderStrikeClub,
      chance: 35,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 48,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: 50,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 28,
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
} as Partial<INPC>;
