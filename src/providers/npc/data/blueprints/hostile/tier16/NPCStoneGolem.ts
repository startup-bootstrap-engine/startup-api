import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  AxesBlueprint,
  BooksBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, RangeTypes, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcStoneGolem: INPCTierBlueprint<16> = {
  ...generateMoveTowardsMovement(),
  name: "Stone Golem",
  key: HostileNPCsBlueprint.StoneGolem,
  subType: NPCSubtype.Elemental,
  textureKey: HostileNPCsBlueprint.StoneGolem,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  speed: MovementSpeed.ExtraSlow,
  baseHealth: 1970,
  ammoKey: RangedWeaponsBlueprint.Stone,
  maxRangeAttack: RangeTypes.High,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 138,
    strength: {
      level: 138,
    },
    dexterity: {
      // @ts-ignore
      level: 30,
    },
    resistance: {
      level: 138,
    },
    magicResistance: {
      level: 138,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.WatermelonSeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
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
      itemBlueprintKey: RangedWeaponsBlueprint.Stone,
      chance: LootProbability.VeryCommon,
      quantityRange: [10, 25],
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
      itemBlueprintKey: CraftingResourcesBlueprint.PolishedStone,
      chance: LootProbability.VeryCommon,
      quantityRange: [5, 15],
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
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: MacesBlueprint.DragonScalCleaverClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PyroclasmGloves,
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
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: LegsBlueprint.KingsGuardLegs,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AxesBlueprint.ExecutionersAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyNeckles,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenGlimmerRing,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.EmberStrandNecklace,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.QuantumSunRing,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.SpellboundCodex,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticalTomes,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.YellowEnchanterHat,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.FrostBiteDagger,
      chance: LootProbability.Rare,
    },
  ],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CleavingStomp,
      probability: 50,
      power: MagicPower.High,
    },
  ],
};
