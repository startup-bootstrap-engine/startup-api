import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";

import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AxesBlueprint,
  DaggersBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  SpearsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcIceCyclops: INPCTierBlueprint<15> = {
  ...generateMoveTowardsMovement(),
  name: "Ice Cyclops",
  key: HostileNPCsBlueprint.IceCyclops,
  textureKey: HostileNPCsBlueprint.IceCyclops,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.ExtraSlow,
  baseHealth: 1470,
  isMagic: true,
  tier: 15,
  subType: NPCSubtype.Elemental,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D20,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 89,
    strength: {
      level: 89,
    },
    dexterity: {
      level: 89,
    },
    resistance: {
      level: 89,
    },
    magicResistance: {
      level: 89,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: DaggersBlueprint.FrostDagger,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SpearsBlueprint.PoseidonTrident,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.PotatoSeed,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: SwordsBlueprint.LightingSword,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: AxesBlueprint.GlacialAxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.FrostArrow,
      chance: LootProbability.VeryCommon,
      quantityRange: [5, 10],
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
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Freezing],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.Blizzard,
      probability: 10,
      power: MagicPower.High,
    },
  ],
};
