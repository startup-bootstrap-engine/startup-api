import { INPC } from "@entities/ModuleNPC/NPCModel";
import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  DaggersBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  SpearsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import {
  AnimationEffectKeys,
  MagicPower,
  NPCAlignment,
  NPCCustomDeathPenalties,
  RangeTypes,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../abstractions/BaseNeutralNPC";

export const npcNazgul: Partial<INPC> = {
  ...generateMoveTowardsMovement(),
  name: "Nazgul",
  key: HostileNPCsBlueprint.Nazgul,
  textureKey: HostileNPCsBlueprint.Nazgul,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  speed: MovementSpeed.Fast,
  ammoKey: AnimationEffectKeys.Dark,
  maxRangeAttack: RangeTypes.High,
  baseHealth: 6000,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  isMagic: true,
  skills: {
    level: 150,
    strength: {
      level: 150,
    },
    dexterity: {
      level: 70,
    },
    resistance: {
      level: 110,
    },
    magicResistance: {
      level: 120,
    },
    magic: {
      level: 80,
    },
  },
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.LeviathanSword,
      chance: 5,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.DarkArmor,
      chance: 1,
    },
    {
      itemBlueprintKey: DaggersBlueprint.PhoenixDagger,
      chance: 10,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 5,
    },
    {
      itemBlueprintKey: HammersBlueprint.SilverHammer,
      chance: 5,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 2,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RustedDoubleVoulge,
      chance: 3,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 30,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 25,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalStoneScepter,
      chance: 30,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: 10,
    },
    {
      itemBlueprintKey: MacesBlueprint.IronWoodCrusherClub,
      chance: 20,
    },
    {
      itemBlueprintKey: AxesBlueprint.DualImpactAxe,
      chance: 22,
    },
    {
      itemBlueprintKey: AxesBlueprint.MaulAxe,
      chance: 24,
    },
    {
      itemBlueprintKey: AxesBlueprint.CrownSplitterAxe,
      chance: 26,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Corruption],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CorruptionWave,
      probability: 5,
      power: MagicPower.UltraHigh,
    },
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 10,
      power: MagicPower.High,
    },
  ],
};
