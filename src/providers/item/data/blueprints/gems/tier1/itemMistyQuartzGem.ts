import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import { EntityAttackType, IItemGem, ItemSubType, ItemType, RangeTypes } from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemMistyQuartzGem: IItemGem = {
  key: GemsBlueprint.MistyQuartzGem,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/misty-quartz-gem.png",
  name: "Misty Quartz Gem",
  description: "Soft misty charm, subtle clarity; a serene and enchanting beauty in this unique gem.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 1,
  basePrice: 380,
  canSell: false,
  rangeType: EntityAttackType.None,
  gemStatBuff: {
    attack: 8,
    defense: 8,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Freezing],
  gemEntityEffectChance: 70,

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
