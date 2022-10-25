import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { EffectableAttribute, ItemUsableEffect } from "@providers/item/helper/ItemUsableEffect";
import { AnimationEffectKeys, SpellCastingType } from "@rpg-engine/shared";
import { SpellsBlueprint } from "../../types/itemsBlueprintTypes";
import { IItemSpell } from "./index";

export const itemSelfHealing: Partial<IItemSpell> = {
  key: SpellsBlueprint.SelfHealingSpell,

  name: "Self Healing Spell",
  description: "A self healing spell.",

  castingType: SpellCastingType.SelfCasting,
  magicWords: "heal me now",
  manaCost: 10,
  minLevelRequired: 2,
  minMagicLevelRequired: 1,
  animationKey: AnimationEffectKeys.LifeHeal,

  usableEffect: (character: ICharacter) => {
    const manaCost = itemSelfHealing.manaCost ?? 0;

    ItemUsableEffect.apply(character, EffectableAttribute.Mana, -1 * manaCost);
    ItemUsableEffect.apply(character, EffectableAttribute.Health, manaCost);
  },
};
