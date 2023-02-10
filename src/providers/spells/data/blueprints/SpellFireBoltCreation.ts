import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { MagicsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { AnimationEffectKeys, SpellCastingType } from "@rpg-engine/shared";
import { SpellItemCreation } from "../abstractions/SpellItemCreation";
import { ISpell, SpellsBlueprint } from "../types/SpellsBlueprintTypes";

export const spellFireBoltCreation: Partial<ISpell> = {
  key: SpellsBlueprint.FireBoltCreationSpell,

  name: "Fire Bolt Creation Spell",
  description: "A spell that creates a fire bolt in your inventory.",

  castingType: SpellCastingType.SelfCasting,
  magicWords: "iquar kiran agni",
  manaCost: 40,
  minLevelRequired: 4,
  minMagicLevelRequired: 3,
  animationKey: AnimationEffectKeys.LevelUp,

  usableEffect: async (character: ICharacter) => {
    const spellRuneCreation = container.get(SpellItemCreation);

    await spellRuneCreation.createItem(character, {
      itemToCreate: {
        key: MagicsBlueprint.FireBoltRune,
      },
      itemToConsume: {
        key: MagicsBlueprint.Rune,
        onErrorMessage: "You do not have any blank rune to create a Fire Bolt Rune.",
      },
    });
  },
};