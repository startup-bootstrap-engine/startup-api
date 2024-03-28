import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { BasicAttribute, ISpell, ShadowWalkerRaces, SpellCastingType, SpellsBlueprint } from "@rpg-engine/shared";
import { SpellCalculator } from "../../abstractions/SpellCalculator";
import { BullStrength } from "../../logic/minotaur/BullStrength";

export const spellBullStrength: Partial<ISpell> = {
  key: SpellsBlueprint.MinotaurBullStrength,
  name: "Bull strength",
  description: "Temporarily increases Minotaur's strength and enlarge body.",
  textureAtlas: "icons",
  texturePath: "spell-icons/minotaur-bull-strength.png",
  castingType: SpellCastingType.SelfCasting,
  magicWords: "moo moo",
  manaCost: 25,
  minLevelRequired: 5,
  minMagicLevelRequired: 5,
  cooldown: 60,
  attribute: BasicAttribute.Strength,
  characterRace: [ShadowWalkerRaces.Minotaur],

  usableEffect: async (character: ICharacter) => {
    const spellCalculator = container.get(SpellCalculator);

    const [timeout, buffPercentage] = await Promise.all([
      spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Strength, {
        min: 15,
        max: 60,
      }),
      spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Strength, {
        min: 5,
        max: 60,
      }),
    ]);

    await container.get(BullStrength).handleBullStrength(character, buffPercentage, timeout);
  },
};
