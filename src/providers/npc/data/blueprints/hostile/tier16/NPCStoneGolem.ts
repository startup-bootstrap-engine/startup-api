import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  AxesBlueprint,
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
  ShieldsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
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
      chance: 20,
    },

    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: 30,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.WingHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.FalconsArmor,
      chance: 1,
    },

    {
      itemBlueprintKey: BootsBlueprint.SilverBoots,
      chance: 5,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.PlateShield,
      chance: 5,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Stone,
      chance: 90,
      quantityRange: [10, 25],
    },
    {
      itemBlueprintKey: HammersBlueprint.SilverHammer,
      chance: 10,
    },

    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 1,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PolishedStone,
      chance: 50,
      quantityRange: [5, 15],
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Rock,
      chance: 30,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherMace,
      chance: 2,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 6,
    },
    {
      itemBlueprintKey: MacesBlueprint.DragonScalCleaverClub,
      chance: 8,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PyroclasmGloves,
      chance: 1,
    },
    {
      itemBlueprintKey: BootsBlueprint.SilverBoots,
      chance: 5,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.PlateShield,
      chance: 5,
    },

    {
      itemBlueprintKey: HammersBlueprint.SilverHammer,
      chance: 10,
    },

    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 1,
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Rock,
      chance: 30,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherMace,
      chance: 2,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PyroclasmGloves,
      chance: 1,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: 50,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.RubyRing,
      chance: 10,
    },
    {
      itemBlueprintKey: LegsBlueprint.KingsGuardLegs,
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
    {
      itemBlueprintKey: AxesBlueprint.BrutalChopperAxe,
      chance: 4,
    },
    {
      itemBlueprintKey: AxesBlueprint.ExecutionersAxe,
      chance: 6,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: 18,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 16,
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
