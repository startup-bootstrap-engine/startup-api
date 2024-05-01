import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { container } from "@providers/inversify/container";
import { EffectableAttribute, ItemUsableEffect } from "@providers/item/helper/ItemUsableEffect";
import { SpellCalculator } from "@providers/spells/data/abstractions/SpellCalculator";
import { BasicAttribute, CharacterClass } from "@rpg-engine/shared";
import { IUsableEffectRune, UsableEffectsBlueprint } from "../types";

export const healRuneUsableEffect: IUsableEffectRune = {
  key: UsableEffectsBlueprint.HealRuneUsableEffect,
  usableEffect: async (caster: ICharacter, target: ICharacter | INPC) => {
    const itemUsableEffect = container.get(ItemUsableEffect);

    const spellCalculator = container.get(SpellCalculator);

    let min;
    let max;

    switch (caster.class) {
      case CharacterClass.Druid:
      case CharacterClass.Sorcerer:
        min = 50;
        max = 100;

        break;

      case CharacterClass.Hunter:
      case CharacterClass.Rogue:
        min = 25;
        max = 50;

        break;

      case CharacterClass.Warrior:
      case CharacterClass.Berserker:
        min = 20;
        max = 30;

        break;
    }

    const percentage = await spellCalculator.calculateBasedOnSkillLevel(caster, BasicAttribute.Magic, {
      min,
      max,
    });

    const totalAmount = (target.maxHealth * percentage) / 100;

    await itemUsableEffect.apply(target, EffectableAttribute.Health, totalAmount);
  },

  usableEffectDescription: "Restores health, based on Magic skill level",
};
