import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  AxesBlueprint,
  BooksBlueprint,
  BootsBlueprint,
  ContainersBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
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

export const npcGiantSpider: INPCTierBlueprint<16> = {
  ...generateMoveTowardsMovement(),
  name: "Giant Spider",
  key: HostileNPCsBlueprint.GiantSpider,
  subType: NPCSubtype.Insect,
  textureKey: HostileNPCsBlueprint.GiantSpider,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  speed: MovementSpeed.Standard,
  ammoKey: AnimationEffectKeys.Green,
  maxRangeAttack: RangeTypes.High,
  baseHealth: 1970,
  tier: 16,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  skills: {
    level: 118,
    strength: {
      level: 118,
    },
    dexterity: {
      level: 138,
    },
    resistance: {
      level: 108,
    },
    magicResistance: {
      level: 108,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: StaffsBlueprint.MoonsStaff,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: ContainersBlueprint.Backpack,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: ShieldsBlueprint.PlateShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.SoldiersHelmet,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.DoubleAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.CorruptionAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HammersBlueprint.WarHammer,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: LootProbability.VeryCommon,
    },

    {
      itemBlueprintKey: ArmorsBlueprint.BronzeArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HammersBlueprint.WarHammer,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.PendantOfLife,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.InfantryHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: AxesBlueprint.HellishAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.JadeEmperorsArmor,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BootsBlueprint.JadeEmperorsBoot,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.KnightArmor,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: LootProbability.VeryCommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.SewingThread,
      chance: LootProbability.VeryCommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Bones,
      chance: LootProbability.VeryCommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: HelmetsBlueprint.WingHelmet,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.FalconsArmor,
      chance: LootProbability.VeryRare,
    },

    {
      itemBlueprintKey: BootsBlueprint.SilverBoots,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.PlateShield,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: HammersBlueprint.SilverHammer,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: LootProbability.VeryRare,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Rock,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherMace,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PyroclasmGloves,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: LootProbability.VeryCommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyRing,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: LegsBlueprint.KingsGuardLegs,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalStoneScepter,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.DragonScalCleaverClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.SpikedCleaverAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.TimberSplitterAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.ButterflierAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.AstralDagger,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StarshardDagger,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.ThunderousClaymore,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.EmberglowRapier,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.AzureNecklace,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.SapphireSerenadeRing,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.EtherealTomes,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: BooksBlueprint.PotioncraftPrimer,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.AmethystArchmageHat,
      chance: LootProbability.Rare,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.NaturesRevenge,
      probability: 10,
      power: MagicPower.High,
    },
  ],
};
