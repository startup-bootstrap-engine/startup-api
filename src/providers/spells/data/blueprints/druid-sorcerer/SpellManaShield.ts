import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
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
      min: 25,
      max: 80,
    });

    await inMemoryHashTable.set("mana-shield", character._id, true);

    const interval = setInterval(async () => {
      character = await Character.findById(character._id).select("_id channelId x y").lean();

      if (!character) {
        clearInterval(interval);
        return;
      }

      await animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.MagicShield);
    }, 1500);

    setTimeout(async () => {
      clearInterval(interval);
      character = await Character.findById(character._id).select("_id channelId x y").lean();

      await inMemoryHashTable.delete("mana-shield", character._id);
      socketMessaging.sendMessageToCharacter(character, "🛡️ Your mana shield has expired.");
    }, timeout * 1000);
  },
};
