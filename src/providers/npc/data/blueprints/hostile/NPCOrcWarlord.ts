import { INPC } from "@entities/ModuleNPC/NPCModel";
import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  AxesBlueprint,
  DaggersBlueprint,
  FoodsBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCCustomDeathPenalties, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../abstractions/BaseNeutralNPC";

export const npcOrcWarlord: Partial<INPC> = {
  ...generateMoveTowardsMovement(),
  name: "Orc Warlord",
  key: HostileNPCsBlueprint.OrcWarlord,
  textureKey: HostileNPCsBlueprint.OrcWarlord,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.ExtraFast,
  baseHealth: 2000,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  skills: {
    level: 100,
    strength: {
      level: 120,
    },
    dexterity: {
      level: 90,
    },
    resistance: {
      level: 130,
    },
    magicResistance: {
      level: 120,
    },
  },
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.Cookie,
      chance: 75,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: DaggersBlueprint.VerdantDagger,
      chance: 25,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.VikingHelmet,
      chance: 10,
    },

    {
      itemBlueprintKey: SwordsBlueprint.LightingSword,
      chance: 15,
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
      itemBlueprintKey: MacesBlueprint.StonefangCleaverClub,
      chance: 6,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalMasherClub,
      chance: 8,
    },
    {
      itemBlueprintKey: MacesBlueprint.MetalStoneScepter,
      chance: 10,
    },
    {
      itemBlueprintKey: MacesBlueprint.GrimHarbingerClub,
      chance: 12,
    },
    {
      itemBlueprintKey: AxesBlueprint.DualImpactAxe,
      chance: 14,
    },
    {
      itemBlueprintKey: AxesBlueprint.MaulAxe,
      chance: 16,
    },
    {
      itemBlueprintKey: AxesBlueprint.CrownSplitterAxe,
      chance: 18,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.Arrowstorm,
      probability: 10,
      power: MagicPower.High,
    },
  ],
};
