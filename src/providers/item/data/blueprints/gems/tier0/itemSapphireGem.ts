import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import { EntityAttackType, IItemGem, ItemSubType, ItemType, RangeTypes } from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSapphireGem: IItemGem = {
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
  basePrice: 330,
  canSell: false,
  rangeType: EntityAttackType.None,
  gemStatBuff: {
    attack: 7,
    defense: 4,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.VineGrasp],
  gemEntityEffectChance: 60,

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
