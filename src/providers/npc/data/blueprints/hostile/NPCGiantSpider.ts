import { INPC } from "@entities/ModuleNPC/NPCModel";
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
  FoodsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  StaffsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { AnimationEffectKeys, NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../abstractions/BaseNeutralNPC";

export const npcGiantSpider: Partial<INPC> = {
  ...generateMoveTowardsMovement(),
  name: "Giant Spider",
  key: HostileNPCsBlueprint.GiantSpider,
  subType: NPCSubtype.Insect,
  textureKey: HostileNPCsBlueprint.GiantSpider,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  speed: MovementSpeed.ExtraFast,
  ammoKey: AnimationEffectKeys.Green,
  maxRangeAttack: 6,
  baseHealth: 1500,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  skills: {
    level: 100,
    strength: {
      level: 85,
    },
    dexterity: {
      level: 80,
    },
    resistance: {
      level: 60,
    },
    magicResistance: {
      level: 50,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: StaffsBlueprint.MoonsStaff,
      chance: 10,
    },

    {
      itemBlueprintKey: ContainersBlueprint.Backpack,
      chance: 25,
    },

    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: 20,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: 20,
    },

    {
      itemBlueprintKey: ShieldsBlueprint.PlateShield,
      chance: 15,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.SoldiersHelmet,
      chance: 30,
    },
    {
      itemBlueprintKey: AxesBlueprint.DoubleAxe,
      chance: 15,
    },
    {
      itemBlueprintKey: AxesBlueprint.CorruptionAxe,
      chance: 15,
    },
    {
      itemBlueprintKey: HammersBlueprint.WarHammer,
      chance: 20,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: 30,
    },

    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: 80,
    },

    {
      itemBlueprintKey: ArmorsBlueprint.BronzeArmor,
      chance: 10,
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
      itemBlueprintKey: ArmorsBlueprint.MithrilArmor,
      chance: 3,
    },
    {
      itemBlueprintKey: LegsBlueprint.MithrilLegs,
      chance: 3,
    },
    {
      itemBlueprintKey: AxesBlueprint.HellishAxe,
      chance: 5,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.JadeEmperorsArmor,
      chance: 5,
    },
    {
      itemBlueprintKey: BootsBlueprint.JadeEmperorsBoot,
      chance: 5,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.KnightArmor,
      chance: 5,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: 80,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Bones,
      chance: 80,
      quantityRange: [1, 10],
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
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
};
