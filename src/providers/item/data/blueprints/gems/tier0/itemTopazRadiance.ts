import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import { EntityAttackType, IItemGem, ItemSubType, ItemType, RangeTypes } from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemTopazRadiance: IItemGem = {
  key: GemsBlueprint.TopazRadiance,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/topaz-radiance.png",
  name: "Topaz Radiance Gem",
  description: "Shiny gold gem, clear and bright, like a sunny spark in a picture.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 1,
  basePrice: 360,
  canSell: false,
  rangeType: EntityAttackType.None,
  gemStatBuff: {
    attack: 7,
    defense: 6,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Corruption],
  gemEntityEffectChance: 60,

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
