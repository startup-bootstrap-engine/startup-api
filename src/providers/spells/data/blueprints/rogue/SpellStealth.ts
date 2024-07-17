import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import {
  AnimationEffectKeys,
  BasicAttribute,
  CharacterClass,
  ISpell,
  SpellCastingType,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { SpellCalculator } from "../../abstractions/SpellCalculator";
import { Stealth } from "../../logic/rogue/Stealth";

export const spellStealth: Partial<ISpell> = {
  key: SpellsBlueprint.RogueStealth,
  name: "Stealth Spell",
  description: "A spell designed to turn a rogue invisible.",
  textureAtlas: "icons",
  texturePath: "spell-icons/rogue-stealth-spell.png",
  castingType: SpellCastingType.SelfCasting,
  magicWords: "talas nelluon",
  manaCost: 120,
  minLevelRequired: 10,
  minMagicLevelRequired: 8,
  cooldown: 120,
  castingAnimationKey: AnimationEffectKeys.ManaHeal,
  characterClass: [CharacterClass.Rogue],

  usableEffect: async (character: ICharacter) => {
    const stealth = container.get(Stealth);
    const spellCalculator = container.get(SpellCalculator);
    const timeout = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
      min: 15,
      max: 40,
    });

    return await stealth.turnInvisible(character, timeout);
  },
};
