import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import {
  AnimationEffectKeys,
  BasicAttribute,
  CharacterClass,
  ISpell,
  SpellCastingType,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { SpellCalculator } from "../../abstractions/SpellCalculator";
import { SpellItemCreation } from "../../abstractions/SpellItemCreation";

export const spellBoltCreation: Partial<ISpell> = {
  key: SpellsBlueprint.BoltCreationSpell,
  name: "Bolt Creation Spell",
  description: "A spell that creates bolt in your inventory.",
  textureAtlas: "icons",
  texturePath: "spell-icons/bolt-creation-spell.png",
  castingType: SpellCastingType.SelfCasting,
  magicWords: "iquar lyn",
  manaCost: 15,
  minLevelRequired: 7,
  minMagicLevelRequired: 3,
  cooldown: 15,
  castingAnimationKey: AnimationEffectKeys.LevelUp,
  characterClass: [CharacterClass.Hunter],

  usableEffect: async (character: ICharacter) => {
    const spellCalculator = container.get(SpellCalculator);
    let minMax = {
      max: 200,
      min: 1,
    };

    if (character.class === CharacterClass.Hunter) {
      minMax = {
        max: 200,
        min: 10,
      };
    }

    const createQty = await spellCalculator.getQuantityBasedOnSkillLevel(character, BasicAttribute.Magic, minMax);

    const spellItemCreation = container.get(SpellItemCreation);

    return await spellItemCreation.createItem(character, {
      itemToCreate: {
        key: RangedWeaponsBlueprint.Bolt,
        createQty,
      },
    });
  },
};
