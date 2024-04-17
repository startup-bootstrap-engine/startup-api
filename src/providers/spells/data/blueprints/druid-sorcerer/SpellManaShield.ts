import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { container } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
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
  manaCost: 60,
  minLevelRequired: 5,
  minMagicLevelRequired: 7,
  cooldown: 120,
  castingAnimationKey: AnimationEffectKeys.MagicShield,
  projectileAnimationKey: AnimationEffectKeys.Energy,
  characterClass: [CharacterClass.Sorcerer, CharacterClass.Druid],

  usableEffect: async (character: ICharacter) => {
    const inMemoryHashTable = container.get(InMemoryHashTable);
    const socketMessaging = container.get(SocketMessaging);
    const animationEffect = container.get(AnimationEffect);
    const spellCalculator = container.get(SpellCalculator);

    const timeout = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
      min: 40,
      max: 120,
    });

    const namespace = `${NamespaceRedisControl.CharacterSpell}:${character._id}`;
    const key = SpellsBlueprint.ManaShield;

    await inMemoryHashTable.set(namespace, key, true);
    await inMemoryHashTable.expire(namespace, timeout, "NX");

    const interval = setInterval(async () => {
      await animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.MagicShield);
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);

      socketMessaging.sendMessageToCharacter(character, "🛡️ Your mana shield has expired.");
    }, timeout * 1000);
  },
};
