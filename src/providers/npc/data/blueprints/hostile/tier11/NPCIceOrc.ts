import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  ContainersBlueprint,
  DaggersBlueprint,
  GlovesBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import {
  AnimationEffectKeys,
  MagicPower,
  NPCAlignment,
  NPCSubtype,
  RangeTypes,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcIceOrc: INPCTierBlueprint<11> = {
  ...generateMoveTowardsMovement(),
  name: "Ice Orc",
  key: HostileNPCsBlueprint.IceOrc,
  subType: NPCSubtype.Animal,
  textureKey: HostileNPCsBlueprint.IceOrc,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.Blue,
  tier: 11,
  maxRangeAttack: RangeTypes.High,
  speed: MovementSpeed.ExtraFast,
  // @ts-ignore
  baseHealth: 670,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToLowHealthTarget: true,
  canSwitchToRandomTarget: true,

  isMagic: true,
  skills: {
    level: 41,
    strength: {
      level: 41,
    },
    dexterity: {
      level: 41,
    },
    resistance: {
      level: 41,
    },
    magicResistance: {
      level: 41,
    },
    magic: {
      level: 41,
    },
  },
  loots: [
    {
      itemBlueprintKey: ContainersBlueprint.Backpack,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: BootsBlueprint.Boots,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.Axe,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: AxesBlueprint.HellishAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.StuddedHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.StuddedArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BootsBlueprint.StuddedBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: GlovesBlueprint.StuddedGloves,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.SpikedClub,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: MacesBlueprint.StarfirMaulClub,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AxesBlueprint.CleaverAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.ThunderboltDagger,
      chance: LootProbability.Rare,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Freezing, EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.Blizzard,
      probability: 10,
      power: MagicPower.High,
    },
  ],
};
