import { INPC } from "@entities/ModuleNPC/NPCModel";
import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  CraftingResourcesBlueprint,
  GlovesBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  PotionsBlueprint,
  RangedWeaponsBlueprint,
  SpearsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../abstractions/BaseNeutralNPC";

export const npcGhoul = {
  ...generateMoveTowardsMovement(),
  name: "Ghoul",
  key: HostileNPCsBlueprint.Ghoul,
  subType: NPCSubtype.Undead,
  textureKey: HostileNPCsBlueprint.Ghoul,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Slow,
  canSwitchToRandomTarget: true,
  baseHealth: 97,
  healthRandomizerDice: Dice.D4,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 6,
    strength: {
      level: 6,
    },
    dexterity: {
      level: 1,
    },
    resistance: {
      level: 5,
    },
  },
  fleeOnLowHealth: false,
  loots: [
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: 10,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: 20,
    },
    {
      itemBlueprintKey: PotionsBlueprint.GreaterLifePotion,
      chance: 20,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Worm,
      chance: 50,
      quantityRange: [10, 15],
    },
    {
      itemBlueprintKey: PotionsBlueprint.ManaPotion,
      chance: 10,
    },
    {
      itemBlueprintKey: LegsBlueprint.StuddedLegs,
      chance: 5,
    },
    {
      itemBlueprintKey: SwordsBlueprint.DoubleEdgedSword,
      chance: 15,
    },
    {
      itemBlueprintKey: GlovesBlueprint.StuddedGloves,
      chance: 20,
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: 2.5,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Arrow,
      chance: 10,
      quantityRange: [10, 13],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Bolt,
      chance: 5,
      quantityRange: [10, 13],
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.Crossbow,
      chance: 4,
    },
    {
      itemBlueprintKey: SwordsBlueprint.Sword,
      chance: 15,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.HellishBow,
      chance: 2,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Eye,
      chance: 15,
      quantityRange: [1, 3],
    },
  ],
} as Partial<INPC>;
