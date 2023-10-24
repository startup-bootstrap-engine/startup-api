import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { container } from "@providers/inversify/container";
import { Execution } from "@providers/spells/data/logic/berserker/Execution";
import {
  AnimationEffectKeys,
  CharacterClass,
  ISpell,
  RangeTypes,
  SpellCastingType,
  SpellsBlueprint,
} from "@rpg-engine/shared";

export const rogueSpellExecution: Partial<ISpell> = {
  key: SpellsBlueprint.RogueExecution,
  name: "Execution",
  description: "The Execution spell is designed to instantly eliminate opponents if target's health is <= 30%",
  textureAtlas: "icons",
  texturePath: "spell-icons/rogue-execution.png",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "supplicium furtim",
  manaCost: 80,
  minLevelRequired: 6,
  minMagicLevelRequired: 6,
  cooldown: 150,
  castingAnimationKey: AnimationEffectKeys.HitCorruption,
  projectileAnimationKey: AnimationEffectKeys.HitCorruption,
  maxDistanceGrid: RangeTypes.Short,
  characterClass: [CharacterClass.Rogue],

  usableEffect: async (character: ICharacter, target: ICharacter | INPC) => {
    await container.get(Execution).handleBerserkerExecution(character, target);
  },
};
