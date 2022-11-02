import { INPC } from "@entities/ModuleNPC/NPCModel";
import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  BootsBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  HelmetsBlueprint,
  OthersBlueprint,
  PotionsBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../abstractions/BaseNeutralNPC";

export const npcStoneGolem: Partial<INPC> = {
  ...generateMoveTowardsMovement(),
  name: "Stone Golem",
  key: HostileNPCsBlueprint.StoneGolem,
  textureKey: HostileNPCsBlueprint.StoneGolem,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Slow,
  baseHealth: 300,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 22,
    strength: {
      level: 22,
    },
    dexterity: {
      level: 2,
    },
    resistance: {
      level: 30,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: OthersBlueprint.GoldCoin,
      chance: 30,
      quantityRange: [30, 80],
    },

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
      itemBlueprintKey: PotionsBlueprint.GreaterLifePotion,
      chance: 30,
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
      itemBlueprintKey: CraftingResourcesBlueprint.IronIngot,
      chance: 30,
      quantityRange: [10, 25],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Obsidian,
      chance: 30,
      quantityRange: [10, 25],
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 1,
    },
  ],
};