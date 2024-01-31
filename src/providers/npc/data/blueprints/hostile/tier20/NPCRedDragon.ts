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

export const npcRedDragon: INPCTierBlueprint<20> = {
  ...generateMoveTowardsMovement(),
  name: "Red Dragon",
  key: HostileNPCsBlueprint.RedDragon,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.RedDragon,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  tier: 20,
  speed: MovementSpeed.ExtraFast,
  // @ts-ignore
  baseHealth: 30000,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  canSwitchToRandomTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,

  isMagic: true,
  skills: {
    level: 298,
    strength: {
      level: 298,
    },
    dexterity: {
      level: 298,
    },
    resistance: {
      level: 298,
    },
    magicResistance: {
      level: 298,
    },
    magic: {
      level: 298,
    },
  },
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.DragonsSword,
      chance: 20,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.TemplarsPlate,
      chance: 2,
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilJianSword,
      chance: 1,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.TemporalRoundShield,
      chance: 2,
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
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: 3,
    },
    {
      itemBlueprintKey: MacesBlueprint.SunderingClub,
      chance: 3,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 6,
    },
    {
      itemBlueprintKey: MacesBlueprint.TwinFangClub,
      chance: 10,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 5,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalStoneScepter,
      chance: 5,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonHead,
      chance: 50,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonTooth,
      chance: 50,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 20,
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
      itemBlueprintKey: AxesBlueprint.MinecraftAxe,
      chance: 10,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: 20,
    },
    {
      itemBlueprintKey: AxesBlueprint.MaulAxe,
      chance: 15,
    },
    {
      itemBlueprintKey: AxesBlueprint.CrownedAxe,
      chance: 14,
    },
    {
      itemBlueprintKey: AxesBlueprint.IroncladCleaver,
      chance: 15,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Burning],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.FireStorm,
      probability: 60,
      power: MagicPower.UltraHigh,
    },
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 30,
      power: MagicPower.Medium,
    },
  ],
};
