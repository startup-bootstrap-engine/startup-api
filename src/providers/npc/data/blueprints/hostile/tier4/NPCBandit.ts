import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  AccessoriesBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { FriendlyNPCsBlueprint, HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcBandit: INPCTierBlueprint<4> = {
  ...generateMoveTowardsMovement(),
  name: "Bandit",
  subType: NPCSubtype.Humanoid,
  key: HostileNPCsBlueprint.Bandit,
  textureKey: FriendlyNPCsBlueprint.MaleNobleBlackHair,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  baseHealth: 190,
  tier: 4,
  healthRandomizerDice: Dice.D6,
  canSwitchToRandomTarget: true,
  skills: {
    level: 12,
    strength: {
      level: 11,
    },
    dexterity: {
      level: 14,
    },
    resistance: {
      level: 11,
    },
    magicResistance: {
      level: 11,
    },
  },
  fleeOnLowHealth: true,

  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.BroadSword,
      chance: 10,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Milk,
      chance: 10,
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: 20,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.AmuletOfLuck,
      chance: 5,
    },
    {
      itemBlueprintKey: GlovesBlueprint.StuddedGloves,
      chance: 20,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.LeatherHelmet,
      chance: 20,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RedHoodie,
      chance: 30,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.BanditShield,
      chance: 20,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.Turban,
      chance: 30,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: 30,
    },
    {
      itemBlueprintKey: LegsBlueprint.LeatherLegs,
      chance: 15,
    },
    {
      itemBlueprintKey: AxesBlueprint.Bardiche,
      chance: 5,
    },
    {
      itemBlueprintKey: AxesBlueprint.Halberd,
      chance: 5,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: 30,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.Bandana,
      chance: 30,
    },
    {
      itemBlueprintKey: BootsBlueprint.SteelBoots,
      chance: 10,
    },
  ],
};
