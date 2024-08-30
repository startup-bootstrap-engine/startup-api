import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { MagicsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { AnimationEffectKeys, CharacterClass, ISpell, SpellCastingType, SpellsBlueprint } from "@rpg-engine/shared";
import { SpellItemCreation } from "../../abstractions/SpellItemCreation";

export const spellBombCreation: Partial<ISpell> = {
  key: SpellsBlueprint.BombCreation,

  name: "Bomb Creation Spell",
  description:
    "This mystical incantation conjures a volatile bomb into your inventory, ready to wreak havoc on your foes.",
  textureAtlas: "icons",
  texturePath: "spell-icons/bomb-creation.png",
  castingType: SpellCastingType.SelfCasting,
  magicWords: "ignitus boomis dynamo",
  manaCost: 25,
  minLevelRequired: 10,
  minMagicLevelRequired: 6,
  cooldown: 5,
  castingAnimationKey: AnimationEffectKeys.LevelUp,
  characterClass: [CharacterClass.Rogue, CharacterClass.Hunter],

  usableEffect: async (character: ICharacter) => {
    const spellRuneCreation = container.get(SpellItemCreation);

    return await spellRuneCreation.createItem(character, {
      itemToCreate: {
        key: MagicsBlueprint.Bomb,
      },
    });
  },
};
