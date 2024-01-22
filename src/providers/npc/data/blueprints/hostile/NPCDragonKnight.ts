import { INPC } from "@entities/ModuleNPC/NPCModel";
import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AxesBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  OthersBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../abstractions/BaseNeutralNPC";

export const npcDragonKnight: Partial<INPC> = {
  ...generateMoveTowardsMovement(),
  name: "Dragon Knight",
  key: HostileNPCsBlueprint.DragonKnight,
  textureKey: HostileNPCsBlueprint.DragonKnight,
  alignment: NPCAlignment.Hostile,
  speed: MovementSpeed.Standard,
  baseHealth: 1200,
  attackType: EntityAttackType.Melee,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  skills: {
    level: 80,
    strength: {
      level: 80,
    },
    dexterity: {
      level: 60,
    },
    resistance: {
      level: 40,
    },
    magicResistance: {
      level: 40,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.Blueberry,
      chance: 75,
      quantityRange: [1, 10],
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: 25,
      quantityRange: [1, 2],
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
      itemBlueprintKey: SwordsBlueprint.RoyalSword,
      chance: 10,
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
      itemBlueprintKey: AxesBlueprint.DaramianWaraxe,
      chance: 3,
    },
    {
      itemBlueprintKey: SwordsBlueprint.GuardianSword,
      chance: 2,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 6,
    },
    {
      itemBlueprintKey: MacesBlueprint.ShatterSpikeClub,
      chance: 8,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
};
