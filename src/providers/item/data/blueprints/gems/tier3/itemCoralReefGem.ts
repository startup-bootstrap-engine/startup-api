import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { IItemGemTier3Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import { EntityAttackType, ItemSubType, ItemType, RangeTypes } from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCoralReefGem: IItemGemTier3Blueprint = {
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
  tier: 3,
  basePrice: 34000,
  canSell: false,
  rangeType: EntityAttackType.None,
  gemStatBuff: {
    attack: 24,
    defense: 26,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Poison],
  gemEntityEffectChance: 25,
  usableEffectDescription: "+24 Attack, +26 Defense, 25% chance to apply Poison effect each hit.",

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
