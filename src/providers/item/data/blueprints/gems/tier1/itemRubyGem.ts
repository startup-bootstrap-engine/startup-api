import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import { EntityAttackType, IItemGem, ItemSubType, ItemType, RangeTypes } from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemRubyGem: IItemGem = {
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
  basePrice: 400,
  canSell: false,
  rangeType: EntityAttackType.None,
  gemStatBuff: {
    attack: 10,
    defense: 8,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Burning],
  gemEntityEffectChance: 70,

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
