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

export const berserkerSpellExecution: Partial<ISpell> = {
  key: SpellsBlueprint.BerserkerExecution,
  name: "Execution",
  description: "The Execution spell is designed to instantly eliminate opponents if target's health is <= 30%",
  textureAtlas: "icons",
  texturePath: "spell-icons/berserker-execution.png",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "insania supplicium",
  manaCost: 150,
  minLevelRequired: 6,
  minMagicLevelRequired: 6,
  cooldown: 150,
  castingAnimationKey: AnimationEffectKeys.HitCorruption,
  projectileAnimationKey: AnimationEffectKeys.HitCorruption,
  targetHitAnimationKey: AnimationEffectKeys.HitCorruption,
  maxDistanceGrid: RangeTypes.UltraShort,
  characterClass: [CharacterClass.Berserker],

  usableEffect: async (character: ICharacter, target: ICharacter | INPC) => {
    const execution = container.get(Execution);

    const executionPromise = (): Promise<boolean> =>
      new Promise((resolve, reject) => {
        try {
          setTimeout(async () => {
            const result = await execution.handleExecution(character, target);
            resolve(result);
          }, 350);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });

    return await executionPromise();
  },
};
