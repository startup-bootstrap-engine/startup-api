import { INPC } from "@entities/ModuleNPC/NPCModel";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import {
  AnimationEffectKeys,
  MagicPower,
  NPCAlignment,
  NPCCustomDeathPenalties,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../abstractions/BaseNeutralNPC";

export const npcDarkElf = {
  ...generateMoveTowardsMovement(),
  name: "Dark Elf",
  key: HostileNPCsBlueprint.DarkElf,
  textureKey: HostileNPCsBlueprint.DarkElf,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: AnimationEffectKeys.Dark,
  maxRangeAttack: 8,
  speed: MovementSpeed.Standard,
  canSwitchToRandomTarget: true,
  baseHealth: 4500,
  canSwitchToLowHealthTarget: true,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  skills: {
    level: 125,
    strength: {
      level: 105,
    },
    dexterity: {
      level: 120,
    },
    resistance: {
      level: 70,
    },
    magicResistance: {
      level: 100,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: StaffsBlueprint.PoisonWand,
      chance: 10,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.PaviseShield,
      chance: 15,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: 15,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: 35,
      quantityRange: [1, 10],
    },
    {
      itemBlueprintKey: DaggersBlueprint.HellishDagger,
      chance: 5,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.HasteRing,
      chance: 1,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.RuneCrossbow,
      chance: 1,
    },
    {
      itemBlueprintKey: MacesBlueprint.BoneBreakerClub,
      chance: 4,
    },
    {
      itemBlueprintKey: MacesBlueprint.StonefangCleaverClub,
      chance: 8,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Poison],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.VampiricStorm,
      probability: 10,
      power: MagicPower.Medium,
    },
    {
      spellKey: SpellsBlueprint.CorruptionWave,
      probability: 10,
      power: MagicPower.UltraHigh,
    },
    {
      spellKey: SpellsBlueprint.Blizzard,
      probability: 25,
      power: MagicPower.UltraHigh,
    },
  ],
} as Partial<INPC>;
