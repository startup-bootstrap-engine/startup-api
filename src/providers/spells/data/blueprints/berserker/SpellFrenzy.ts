import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterBuffActivator } from "@providers/character/characterBuff/CharacterBuffActivator";
import { container } from "@providers/inversify/container";
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
import { SpellCalculator } from "../../abstractions/SpellCalculator";

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
    const spellCalculator = await container.get(SpellCalculator);

    const timeout = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Dexterity, {
      min: 10,
      max: 60,
    });
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
