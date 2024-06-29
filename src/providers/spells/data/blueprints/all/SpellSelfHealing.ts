import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { container } from "@providers/inversify/container";
import { EffectableAttribute, ItemUsableEffect } from "@providers/item/helper/ItemUsableEffect";
import { AnimationEffectKeys, BasicAttribute, ISpell, SpellCastingType, SpellsBlueprint } from "@rpg-engine/shared";
import { SpellCalculator } from "../../abstractions/SpellCalculator";

export const spellSelfHealing: Partial<ISpell> = {
  key: SpellsBlueprint.SelfHealingSpell,
  name: "Self Healing Spell",
  description: "A self healing spell.",
  textureAtlas: "icons",
  texturePath: "spell-icons/self-healing-spell.png",
  castingType: SpellCastingType.SelfCasting,
  magicWords: "talas faenya",
  manaCost: 20,
  minLevelRequired: 2,
  minMagicLevelRequired: 1,
  cooldown: 5,
  castingAnimationKey: AnimationEffectKeys.Lifedrain,

  usableEffect: async (caster: ICharacter | INPC) => {
    const itemUsableEffect = container.get(ItemUsableEffect);
    const spellCalculator = container.get(SpellCalculator);
    const percentage = await spellCalculator.calculateBasedOnSkillLevel(caster, BasicAttribute.Magic, {
      min: 10,
      max: 15,
    });

    let totalAmount = (caster.maxHealth * percentage) / 100;

    if (totalAmount > 500) {
      totalAmount = 500;
    }

    await itemUsableEffect.apply(caster, EffectableAttribute.Health, totalAmount);
  },
};
