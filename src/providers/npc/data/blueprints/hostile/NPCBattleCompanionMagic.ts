import { INPC } from "@entities/ModuleNPC/NPCModel";
import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { AnimationEffectKeys, NPCAlignment } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../abstractions/BaseNeutralNPC";

export const npcBattleCompanionMagic: Partial<INPC> = {
  ...generateMoveTowardsMovement(),
  name: "Magic Battle Companion",
  key: HostileNPCsBlueprint.BattleCompanionMagic,
  textureKey: HostileNPCsBlueprint.DwarfMage,
  isMagic: true,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: AnimationEffectKeys.Blue,
  maxRangeAttack: 8,
  speed: MovementSpeed.Standard,
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
};
