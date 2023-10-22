import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { CharacterBuffActivator } from "@providers/character/characterBuff/CharacterBuffActivator";
import { container } from "@providers/inversify/container";
import { TraitGetter } from "@providers/skill/TraitGetter";
import {
  AnimationEffectKeys,
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  CharacterClass,
  ISpell,
  SpellCastingType,
  SpellsBlueprint,
} from "@rpg-engine/shared";

export const spellFrenzy: Partial<ISpell> = {
  key: SpellsBlueprint.BerserkerFrenzy,
  name: "Frenzy",
  description: "A spell that causes a frenzy by increasing your attack speed but lowering your defense.",
  textureAtlas: "icons",
  texturePath: "spell-icons/berserker-frenzy.png",
  castingType: SpellCastingType.SelfCasting,
  magicWords: "kartal insanus",
  manaCost: 80,
  minLevelRequired: 7,
  minMagicLevelRequired: 6,
  cooldown: 120,
  castingAnimationKey: AnimationEffectKeys.QuickFire,
  characterClass: [CharacterClass.Berserker],

  usableEffect: async (character: ICharacter) => {
    const characterBuffActivator = container.get(CharacterBuffActivator);
    const traitGetter = container.get(TraitGetter);

    const skills = (await Skill.findById(character.skills)
      .lean()
      .cacheQuery({
        cacheKey: `${character?._id}-skills`,
      })) as ISkill;

    const characterStrength = await traitGetter.getSkillLevelWithBuffs(skills, BasicAttribute.Strength);
    const characterDexterity = await traitGetter.getSkillLevelWithBuffs(skills, BasicAttribute.Dexterity);

    const timeoutWeightedAverage = characterStrength * 0.6 + characterDexterity * 0.4;
    const timeout = Math.min(Math.max(timeoutWeightedAverage * 2, 20), 120);

    await characterBuffActivator.enableTemporaryBuff(character, {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.AttackIntervalSpeed,
      buffPercentage: -20, // reduce attack interval speed by 20%
      durationSeconds: timeout,
      durationType: CharacterBuffDurationType.Temporary,
      options: {
        messages: {
          activation:
            "Berserker's Frenzy has been activated! Your attack speed has been increased (but your resistance was reduced)!",
          deactivation: "Berserker's Frenzy has been deactivated!",
        },
      },
      isStackable: false,
      originateFrom: SpellsBlueprint.BerserkerFrenzy + "-" + CharacterAttributes.AttackIntervalSpeed,
    });

    await characterBuffActivator.enableTemporaryBuff(character, {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: -50, // reduce resistance by 50%
      durationSeconds: timeout,
      durationType: CharacterBuffDurationType.Temporary,
      options: {
        messages: {
          skipAllMessages: true,
        },
      },
      isStackable: false,
      originateFrom: SpellsBlueprint.BerserkerFrenzy + "-" + BasicAttribute.Resistance,
    });
  },
};
