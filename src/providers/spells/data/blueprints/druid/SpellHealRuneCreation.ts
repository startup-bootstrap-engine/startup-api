import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { MagicsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { AnimationEffectKeys, CharacterClass, ISpell, SpellCastingType, SpellsBlueprint } from "@rpg-engine/shared";
import { SpellItemCreation } from "../../abstractions/SpellItemCreation";

export const spellHealRuneCreation: Partial<ISpell> = {
  key: SpellsBlueprint.HealRuneCreationSpell,

  name: "Healing Rune Creation Spell",
  description: "A spell that converts a blank rune, in your inventory, into healing rune.",

  castingType: SpellCastingType.SelfCasting,
  magicWords: "iquar ansr faenya",
  manaCost: 400,
  minLevelRequired: 18,
  minMagicLevelRequired: 18,
  cooldown: 5,
  castingAnimationKey: AnimationEffectKeys.LevelUp,
  characterClass: [CharacterClass.Druid],

  requiredItem: MagicsBlueprint.Rune,

  usableEffect: async (character: ICharacter) => {
    const spellRuneCreation = container.get(SpellItemCreation);

    return await spellRuneCreation.createItem(character, {
      itemToCreate: {
        key: MagicsBlueprint.HealRune,
      },
      itemToConsume: {
        key: MagicsBlueprint.Rune,
        onErrorMessage: "You do not have any blank rune to create a Heal Rune.",
      },
    });
  },
};
