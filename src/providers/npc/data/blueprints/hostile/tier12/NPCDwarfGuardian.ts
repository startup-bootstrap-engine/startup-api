import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  ContainersBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { SpellsBlueprint } from "@providers/spells/data/types/SpellsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcDwarfGuardian: INPCTierBlueprint<12> = {
  ...generateMoveTowardsMovement(),
  name: "Dwarf Guardian",
  subType: NPCSubtype.Humanoid,
  tier: 12,
  key: HostileNPCsBlueprint.DwarfGuardian,
  textureKey: HostileNPCsBlueprint.DwarfGuardian,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  baseHealth: 720,
  healthRandomizerDice: Dice.D12,
  canSwitchToRandomTarget: true,
  skills: {
    level: 53,
    strength: {
      level: 53,
    },
    dexterity: {
      level: 56,
    },
    resistance: {
      level: 56,
    },
    magicResistance: {
      level: 56,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: ContainersBlueprint.Backpack,
      chance: 10,
    },

    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: 25,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.ScutumShield,
      chance: 10,
    },
    {
      itemBlueprintKey: GlovesBlueprint.ChainGloves,
      chance: 10,
    },

    {
      itemBlueprintKey: RangedWeaponsBlueprint.IronArrow,
      chance: 50,
      quantityRange: [10, 30],
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedMace,
      chance: 7,
    },

    {
      itemBlueprintKey: HelmetsBlueprint.GladiatorHelmet,
      chance: 10,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Salmon,
      chance: 30,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyRing,
      chance: 2,
    },
    {
      itemBlueprintKey: SpearsBlueprint.Corseque,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.EnchantedSword,
      chance: 15,
    },
    {
      itemBlueprintKey: DaggersBlueprint.VerdantDagger,
      chance: 10,
    },

    {
      itemBlueprintKey: AxesBlueprint.MoonBeamAxe,
      chance: 2,
    },
    {
      itemBlueprintKey: BootsBlueprint.BronzeBoots,
      chance: 5,
    },
    {
      itemBlueprintKey: BootsBlueprint.RoyalBoots,
      chance: 3,
    },
    {
      itemBlueprintKey: SpearsBlueprint.GuanDao,
      chance: 10,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: 30,
    },
    {
      itemBlueprintKey: SwordsBlueprint.PoisonSword,
      chance: 20,
    },

    {
      itemBlueprintKey: DaggersBlueprint.CopperJitte,
      chance: 10,
    },
    {
      itemBlueprintKey: DaggersBlueprint.DamascusJitte,
      chance: 10,
    },

    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: 85,
    },
    {
      itemBlueprintKey: SpearsBlueprint.Trident,
      chance: 4,
    },
    {
      itemBlueprintKey: SwordsBlueprint.KnightsSword,
      chance: 5,
    },
    {
      itemBlueprintKey: HammersBlueprint.WarHammer,
      chance: 10,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.InfantryHelmet,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.BasiliskSword,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CopperBroadsword,
      chance: 10,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Jade,
      chance: 20,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: SwordsBlueprint.PixieCutSword,
      chance: 3,
    },
    {
      itemBlueprintKey: SwordsBlueprint.StellarBlade,
      chance: 2,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CleavingStomp,
      probability: 50,
      power: MagicPower.High,
    },
  ],
};
