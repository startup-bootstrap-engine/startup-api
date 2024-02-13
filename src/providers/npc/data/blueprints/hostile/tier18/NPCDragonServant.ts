import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  AxesBlueprint,
  BooksBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  GemsBlueprint,
  GlovesBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  OthersBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import {
  AnimationEffectKeys,
  MagicPower,
  MagicsBlueprint,
  NPCAlignment,
  NPCCustomDeathPenalties,
  NPCSubtype,
  RangeTypes,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcDragonServant: INPCTierBlueprint<18> = {
  ...generateMoveTowardsMovement(),
  name: "Dragon's Servant",
  key: HostileNPCsBlueprint.DragonServant,
  textureKey: HostileNPCsBlueprint.Kobold,
  alignment: NPCAlignment.Hostile,
  speed: MovementSpeed.Standard,
  baseHealth: 2770,
  tier: 18,
  subType: NPCSubtype.Humanoid,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.FireBall,
  maxRangeAttack: RangeTypes.High,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  skills: {
    level: 208,
    strength: {
      level: 208,
    },
    dexterity: {
      level: 208,
    },
    resistance: {
      level: 208,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 20,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.DemonShield,
      chance: 20,
    },
    {
      itemBlueprintKey: SwordsBlueprint.YggdrasilGladius,
      chance: 2,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 20,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: 35,
      quantityRange: [1, 6],
    },
    {
      itemBlueprintKey: HelmetsBlueprint.BerserkersHelmet,
      chance: 2,
    },
    {
      itemBlueprintKey: OthersBlueprint.GoldCoin,
      chance: 50,
      quantityRange: [25, 75],
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
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: 1,
    },
    {
      itemBlueprintKey: BooksBlueprint.EmberSageScripture,
      chance: 2,
    },
    {
      itemBlueprintKey: MagicsBlueprint.Rune,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.EldensSword,
      chance: 2,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.DragonTooth,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.GuardianSword,
      chance: 5,
    },
    {
      itemBlueprintKey: StaffsBlueprint.ElementalStaff,
      chance: 2,
    },
    {
      itemBlueprintKey: GlovesBlueprint.GenesisGloves,
      chance: 2,
    },
    {
      itemBlueprintKey: LegsBlueprint.DragonScaleLegs,
      chance: 5,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 26,
    },
    {
      itemBlueprintKey: MacesBlueprint.DragonScalCleaverClub,
      chance: 18,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 20,
    },
    {
      itemBlueprintKey: MacesBlueprint.StonefangCleaverClub,
      chance: 17,
    },
    {
      itemBlueprintKey: MacesBlueprint.IronWoodCrusherClub,
      chance: 28,
    },
    {
      itemBlueprintKey: AxesBlueprint.BoneReaperAxe,
      chance: 30,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: 32,
    },
    {
      itemBlueprintKey: AxesBlueprint.TwinEdgeAxe,
      chance: 34,
    },
    {
      itemBlueprintKey: DaggersBlueprint.DarkmoonDagger,
      chance: 28,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 30,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ArrowheadDagger,
      chance: 32,
    },
    {
      itemBlueprintKey: GemsBlueprint.CoralReefGem,
      chance: 1,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireStrandNecklace,
      chance: 2,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyglintNecklace,
      chance: 10,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.MoonstoneRing,
      chance: 12,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Burning],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.FireStorm,
      probability: 30,
      power: MagicPower.UltraHigh,
    },
  ],
};
