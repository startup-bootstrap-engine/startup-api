import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { SpellAreaProbability } from "@providers/spells/area-spells/NPCSpellAreaTypes";
import { MagicPower, NPCAlignment, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";
import { IBaseNPCBlueprint } from "../../../types/npcTierTypes";

export const npcBattleCompanion: IBaseNPCBlueprint = {
  ...generateMoveTowardsMovement(),
  name: "Battle Companion",
  key: HostileNPCsBlueprint.BattleCompanion,
  // @ts-ignore
  textureKey: "elf-white-hair-1",
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Fast,
  baseHealth: 99999,
  healthRandomizerDice: Dice.D6,
  canSwitchToRandomTarget: false,
  isGiantForm: false,
  skills: {
    level: 1,
    strength: {
      level: 1,
    },
    dexterity: {
      level: 1,
    },
    resistance: {
      level: 1,
    },
  },
  fleeOnLowHealth: true,

  loots: [],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.SelfHealingSpell,
      probability: SpellAreaProbability.VeryCommon,
      power: MagicPower.High,
    },
  ],
};
