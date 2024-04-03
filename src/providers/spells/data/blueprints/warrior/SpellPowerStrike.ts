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

export const spellPowerStrike: Partial<ISpell> = {
  key: SpellsBlueprint.PowerStrike,
  name: "Power Strike",
  description: "Temporarily increases the warrior's strength.",
  textureAtlas: "icons",
  texturePath: "spell-icons/power-strike.png",
  castingType: SpellCastingType.SelfCasting,
  magicWords: "gûl-eglir",
  manaCost: 40,
  minLevelRequired: 4,
  minMagicLevelRequired: 5,
  cooldown: 80,
  castingAnimationKey: AnimationEffectKeys.BlueWings,
  attribute: BasicAttribute.Strength,
  characterClass: [CharacterClass.Warrior],

  usableEffect: async (character: ICharacter) => {
    const characterBuffActivator = container.get(CharacterBuffActivator);
    const spellCalculator = container.get(SpellCalculator);

    const timeout = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
      min: 20,
      max: 120,
    });

    const buffPercentage = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
      min: 15,
      max: 60,
    });

    await characterBuffActivator.enableTemporaryBuff(character, {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage,
      durationSeconds: timeout,
      durationType: CharacterBuffDurationType.Temporary,
      isStackable: false,
      originateFrom: SpellsBlueprint.PowerStrike,
    });
  },
};
