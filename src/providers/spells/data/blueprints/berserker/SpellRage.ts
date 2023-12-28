import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterBuffActivator } from "@providers/character/characterBuff/CharacterBuffActivator";
import { container } from "@providers/inversify/container";
import {
  AnimationEffectKeys,
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  CharacterClass,
  ISpell,
  SpellCastingType,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { SpellCalculator } from "../../abstractions/SpellCalculator";

export const spellRage: Partial<ISpell> = {
  key: SpellsBlueprint.BerserkerRage,
  name: "Fury",
  description:
    "This spell unleashes a primal fury, imbuing the caster with untold strength and recklessness, but at a great cost to their defensive capabilities",
  textureAtlas: "icons",
  texturePath: "spell-icons/berserker-rage.png",
  castingType: SpellCastingType.SelfCasting,
  magicWords: "furore",
  manaCost: 90,
  minLevelRequired: 4,
  minMagicLevelRequired: 3,
  cooldown: 60,
  castingAnimationKey: AnimationEffectKeys.Burn,
  characterClass: [CharacterClass.Berserker],

  usableEffect: async (character: ICharacter) => {
    const characterBuffActivator = container.get(CharacterBuffActivator);

    const spellCalculator = await container.get(SpellCalculator);

    const timeout = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Strength, {
      min: 25,
      max: 60,
    });

    await characterBuffActivator.enableTemporaryBuff(character, {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 150,
      durationSeconds: timeout,
      durationType: CharacterBuffDurationType.Temporary,
      options: {
        messages: {
          activation:
            "Berserker's rage has been activated! Your strength has been increased (but your resistance was reduced)!",
          deactivation: "Berserker's Rage has been deactivated!",
        },
      },
      isStackable: false,
      originateFrom: SpellsBlueprint.BerserkerRage + "-" + BasicAttribute.Strength,
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
      originateFrom: SpellsBlueprint.BerserkerRage + "-" + BasicAttribute.Resistance,
    });
  },
};
