import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { IItemGemTier1Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import { EntityAttackType, ItemSubType, ItemType, RangeTypes } from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSapphireGem: IItemGemTier1Blueprint = {
  key: GemsBlueprint.SapphireGem,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/sapphire-gem.png",
  name: "Sapphire Gem",
  description: "Deep blue allure, clear brilliance, timeless elegance captured in the essence of this precious stone.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 2,
  basePrice: 12000,
  canSell: false,
  rangeType: EntityAttackType.None,
  tier: 1,
  gemStatBuff: {
    attack: 8,
    defense: 6,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.VineGrasp],
  gemEntityEffectChance: 12,
  usableEffectDescription: "+8 Attack, +5 Defense, 12% chance to apply Vine Grasp effect each hit.",

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
