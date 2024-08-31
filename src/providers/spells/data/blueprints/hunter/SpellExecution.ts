import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { HUNTER_EXECUTION_HEALTH_THRESHOLD } from "@providers/constants/BattleConstants";
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

export const spellHunterExecution: Partial<ISpell> = {
  key: SpellsBlueprint.HunterExecution,
  name: "Headshot",
  description: "The Execution spell is designed to instantly eliminate opponents if target's health is <= 15%",
  textureAtlas: "icons",
  texturePath: "spell-icons/berserker-execution.png",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "insania supplicium",
  manaCost: 175,
  minLevelRequired: 6,
  minMagicLevelRequired: 6,
  cooldown: 150,
  castingAnimationKey: AnimationEffectKeys.BlueWings,
  projectileAnimationKey: AnimationEffectKeys.Arrow,
  targetHitAnimationKey: AnimationEffectKeys.Corruption,
  maxDistanceGrid: RangeTypes.Medium,
  characterClass: [CharacterClass.Hunter],

  usableEffect: async (character: ICharacter, target: ICharacter | INPC) => {
    const execution = container.get(Execution);

    const executionPromise = (): Promise<boolean> =>
      new Promise((resolve, reject) => {
        try {
          setTimeout(async () => {
            const result = await execution.handleExecution(character, target, HUNTER_EXECUTION_HEALTH_THRESHOLD);
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
