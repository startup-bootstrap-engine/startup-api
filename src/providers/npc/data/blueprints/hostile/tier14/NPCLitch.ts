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
  GlovesBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  OthersBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
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

export const npcLitch: INPCTierBlueprint<14> = {
  ...generateMoveTowardsMovement(),
  name: "Litch",
  key: HostileNPCsBlueprint.Litch,
  textureKey: HostileNPCsBlueprint.Litch,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.Fast,
  baseHealth: 1120,
  tier: 14,
  subType: NPCSubtype.Undead,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  isMagic: true,
  skills: {
    level: 77,
    strength: {
      level: 77,
    },
    dexterity: {
      level: 77,
    },
    resistance: {
      level: 77,
    },
    magicResistance: {
      level: 77,
    },
    magic: {
      level: 77,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: 15,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: 35,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: DaggersBlueprint.HellishDagger,
      chance: 5,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.HasteRing,
      chance: 1,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.RuneCrossbow,
      chance: 1,
    },
    {
      itemBlueprintKey: OthersBlueprint.GoldCoin,
      chance: 65,
      quantityRange: [10, 50],
    },
    {
      itemBlueprintKey: StaffsBlueprint.MoonsStaff,
      chance: 30,
    },
    {
      itemBlueprintKey: DaggersBlueprint.SapphireDagger,
      chance: 10,
    },
    {
      itemBlueprintKey: DaggersBlueprint.SapphireJitte,
      chance: 10,
    },
    {
      itemBlueprintKey: StaffsBlueprint.CorruptionStaff,
      chance: 30,
    },
    {
      itemBlueprintKey: StaffsBlueprint.FireStaff,
      chance: 30,
    },
    {
      itemBlueprintKey: ContainersBlueprint.Backpack,
      chance: 10,
    },

    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: 20,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: 85,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: 5,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DarkShield,
      chance: 1,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PhoenixFeather,
      chance: 30,
      quantityRange: [5, 8],
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 5,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.HellishBow,
      chance: 2,
    },
    {
      itemBlueprintKey: SwordsBlueprint.IronFistSword,
      chance: 5,
    },
    {
      itemBlueprintKey: GlovesBlueprint.CrimsonCrestWraps,
      chance: 1,
    },
    {
      itemBlueprintKey: MacesBlueprint.ThunderStrikeClub,
      chance: 3,
    },
    {
      itemBlueprintKey: MacesBlueprint.IronWoodCrusherClub,
      chance: 5,
    },
    {
      itemBlueprintKey: AxesBlueprint.BoneReaperAxe,
      chance: 3,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 4,
    },
    {
      itemBlueprintKey: AxesBlueprint.TwinEdgeAxe,
      chance: 6,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Burning, EntityEffectBlueprint.Corruption],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.FireStorm,
      probability: 10,
      power: MagicPower.Medium,
    },
    {
      spellKey: SpellsBlueprint.CorruptionWave,
      probability: 10,
      power: MagicPower.Medium,
    },
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 10,
      power: MagicPower.Medium,
    },
  ],
};
