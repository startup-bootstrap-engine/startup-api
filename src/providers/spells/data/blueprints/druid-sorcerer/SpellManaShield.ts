import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
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
import { NamespaceRedisControl } from "../../types/SpellsBlueprintTypes";

export const spellManaShield: Partial<ISpell> = {
  key: SpellsBlueprint.ManaShield,
  name: "Mana Shield",
  description: "A spell specifically designed for mages that redirects damage from health to mana.",
  textureAtlas: "icons",
  texturePath: "spell-icons/mana-shield.png",
  castingType: SpellCastingType.SelfCasting,
  magicWords: "mana scutum",
  manaCost: 40,
  minLevelRequired: 5,
  minMagicLevelRequired: 7,
  cooldown: 120,
  castingAnimationKey: AnimationEffectKeys.MagicShield,
  projectileAnimationKey: AnimationEffectKeys.Energy,
  characterClass: [CharacterClass.Sorcerer, CharacterClass.Druid],

  usableEffect: async (character: ICharacter) => {
    const inMemoryHashTable = container.get(InMemoryHashTable);

    const spellCalculator = container.get(SpellCalculator);

    const timeout = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
      min: 40,
      max: 120,
    });

    const namespace = `${NamespaceRedisControl.CharacterSpell}:${character._id}`;
    const key = SpellsBlueprint.ManaShield;

    await inMemoryHashTable.set(namespace, key, true);
    await inMemoryHashTable.expire(namespace, timeout, "NX");
  },
};
