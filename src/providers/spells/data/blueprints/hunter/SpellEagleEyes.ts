import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterBuffActivator } from "@providers/character/characterBuff/CharacterBuffActivator";
import { container } from "@providers/inversify/container";
import {
  AnimationEffectKeys,
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  CharacterClass,
  CombatSkill,
  ISpell,
  SpellCastingType,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { SpellCalculator } from "../../abstractions/SpellCalculator";

export const spellEagleEyes: Partial<ISpell> = {
  key: SpellsBlueprint.SpellEagleEyes,
  name: "Eagle Eyes",
  textureAtlas: "icons",
  texturePath: "spell-icons/spell-eagle-eyes.png",
  description: "Increase hunter's distance skill for a short period of time.",
  castingType: SpellCastingType.SelfCasting,
  magicWords: "kartal leri",
  manaCost: 60,
  minLevelRequired: 7,
  minMagicLevelRequired: 4,
  cooldown: 180,
  castingAnimationKey: AnimationEffectKeys.ManaHeal,
  attribute: CombatSkill.Distance,
  characterClass: [CharacterClass.Hunter],

  usableEffect: async (character: ICharacter) => {
    const characterBuffActivator = container.get(CharacterBuffActivator);
    const spellCalculator = container.get(SpellCalculator);

    const timeout = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
      min: 20,
      max: 180,
    });

    const buffPercentage = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
      min: 10,
      max: 60,
    });

    await characterBuffActivator.enableTemporaryBuff(character, {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Distance,
      buffPercentage,
      durationSeconds: timeout,
      durationType: CharacterBuffDurationType.Temporary,
      isStackable: false,
      originateFrom: SpellsBlueprint.SpellEagleEyes,
    });
  },
};
