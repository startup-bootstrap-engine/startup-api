import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { IItemGemTier8Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  CombatSkill,
  EntityAttackType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemRubyGem: IItemGemTier8Blueprint = {
  key: GemsBlueprint.RubyGem,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/ruby-gem.png",
  name: "Ruby Gem",
  description: "Vibrant red charm, clear brilliance; a timeless and captivating beauty in this precious jewel.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 1.5,
  basePrice: 90000,
  canSell: false,
  rangeType: EntityAttackType.None,
  tier: 8,
  gemStatBuff: {
    attack: 60,
    defense: 59,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Burning],
  gemEntityEffectChance: 68,
  usableEffectDescription:
    "+60 Attack, +59 Defense, 68% chance to apply Burning effect each hit. Buff: +20% Sword, +15% Resistance, +15% Magic Resistance.",

  gemEquippedBuffAdd: [
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Sword,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
