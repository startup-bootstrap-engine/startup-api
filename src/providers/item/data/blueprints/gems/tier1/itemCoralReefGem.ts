import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import { EntityAttackType, IItemGem, ItemSubType, ItemType, RangeTypes } from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCoralReefGem: IItemGem = {
  key: GemsBlueprint.CoralReefGem,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/coral-reef-gem.png",
  name: "Coral Reef Gem",
  description: "Tropical coral tones, vivid clarity; a vibrant and nature-inspired beauty in this unique gem.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 1.5,
  basePrice: 450,
  canSell: false,
  rangeType: EntityAttackType.None,
  gemStatBuff: {
    attack: 12,
    defense: 10,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Poison],
  gemEntityEffectChance: 70,

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
