import { INPC } from "@entities/ModuleNPC/NPCModel";
import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype, RangeTypes } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../abstractions/BaseNeutralNPC";

export const npcStoneGolem: Partial<INPC> = {
  ...generateMoveTowardsMovement(),
  name: "Stone Golem",
  key: HostileNPCsBlueprint.StoneGolem,
  subType: NPCSubtype.Elemental,
  textureKey: HostileNPCsBlueprint.StoneGolem,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  speed: MovementSpeed.Slow,
  baseHealth: 1500,
  ammoKey: RangedWeaponsBlueprint.Stone,
  maxRangeAttack: RangeTypes.High,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 120,
    strength: {
      level: 100,
    },
    dexterity: {
      level: 10,
    },
    resistance: {
      level: 100,
    },
    magicResistance: {
      level: 80,
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
  ],
};
