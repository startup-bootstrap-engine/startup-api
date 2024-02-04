import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  MagicsBlueprint,
  PotionsBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcCaveTroll: INPCTierBlueprint<13> = {
  ...generateMoveTowardsMovement(),
  name: "Cave Troll",
  key: HostileNPCsBlueprint.CaveTroll,
  textureKey: HostileNPCsBlueprint.CaveTroll,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  baseHealth: 920,
  tier: 13,
  subType: NPCSubtype.Humanoid,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 74,
    strength: {
      level: 74,
    },
    dexterity: {
      level: 74,
    },
    resistance: {
      level: 74,
    },
    magicResistance: {
      level: 74,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: 25,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.WingHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.KiteShield,
      chance: 5,
    },

    {
      itemBlueprintKey: SwordsBlueprint.LongSword,
      chance: 15,
    },
    {
      itemBlueprintKey: GlovesBlueprint.ChainGloves,
      chance: 10,
    },
    {
      itemBlueprintKey: PotionsBlueprint.LightEndurancePotion,
      chance: 30,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: 50,
      quantityRange: [5, 10],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.ElvenBow,
      chance: 10,
    },

    {
      itemBlueprintKey: FoodsBlueprint.Salmon,
      chance: 30,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.GreaterWoodenLog,
      chance: 30,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: SwordsBlueprint.DoubleEdgedSword,
      chance: 15,
    },
    {
      itemBlueprintKey: MagicsBlueprint.FireRune,
      chance: 10,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SpikedShield,
      chance: 20,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.GreenOre,
      chance: 20,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: MacesBlueprint.WitchBaneMace,
      chance: 2,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: 10,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
};
