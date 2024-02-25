import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  AxesBlueprint,
  BooksBlueprint,
  BootsBlueprint,
  DaggersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  PotionsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import {
  AnimationEffectKeys,
  MagicPower,
  NPCAlignment,
  NPCSubtype,
  RangeTypes,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcCorruptedKobold: INPCTierBlueprint<18> = {
  ...generateMoveTowardsMovement(),
  name: "Corrupted Kobold",
  key: HostileNPCsBlueprint.CorruptedKobold,
  textureKey: HostileNPCsBlueprint.CorruptedKobold,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Standard,
  tier: 18,
  subType: NPCSubtype.Humanoid,
  baseHealth: 2770,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  isMagic: true,
  skills: {
    level: 218,
    strength: {
      level: 218,
    },
    dexterity: {
      level: 218,
    },
    resistance: {
      level: 218,
    },
    magicResistance: {
      level: 218,
    },
    magic: {
      level: 218,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: DaggersBlueprint.CorruptionDagger,
      chance: 25,
    },
    {
      itemBlueprintKey: SwordsBlueprint.FalconsSword,
      chance: 15,
    },
    {
      itemBlueprintKey: SwordsBlueprint.LongSword,
      chance: 20,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.KiteShield,
      chance: 10,
    },
    {
      itemBlueprintKey: PotionsBlueprint.LightEndurancePotion,
      chance: 20,
    },
    {
      itemBlueprintKey: SwordsBlueprint.EonGuardianSword,
      chance: 2,
    },
    {
      itemBlueprintKey: BootsBlueprint.SolarflareBoots,
      chance: 10,
    },
    {
      itemBlueprintKey: MacesBlueprint.ThunderStrikeClub,
      chance: 10,
    },
    {
      itemBlueprintKey: MacesBlueprint.StarfirMaulClub,
      chance: 12,
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: 14,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: 16,
    },
    {
      itemBlueprintKey: AxesBlueprint.MaulAxe,
      chance: 18,
    },
    {
      itemBlueprintKey: AxesBlueprint.CrownedAxe,
      chance: 20,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: 18,
    },
    {
      itemBlueprintKey: DaggersBlueprint.DarkmoonDagger,
      chance: 20,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: 22,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CelestialEdge,
      chance: 12,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CelestialSaber,
      chance: 12,
    },
    {
      itemBlueprintKey: SwordsBlueprint.FrostfireLongblade,
      chance: 12,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SunlitRubyNecklace,
      chance: 2,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.WoodenRing,
      chance: 8,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticCompendium,
      chance: 4,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticalMemoirs,
      chance: 5,
    },
    {
      itemBlueprintKey: BooksBlueprint.DruidicLoreVolume,
      chance: 7,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.AmethystArchmageHat,
      chance: 8,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: 44,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 44,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: 40,
    },
    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: 40,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 58,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 56,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: 24,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: 24,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: 24,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 56,
    },
    {
      itemBlueprintKey: AxesBlueprint.GuardianAxe,
      chance: 30,
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
