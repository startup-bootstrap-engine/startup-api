import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { IItemGemTier9Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import { EntityAttackType, ItemSubType, ItemType, RangeTypes } from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemTopazRadiance: IItemGemTier9Blueprint = {
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
  basePrice: 100000,
  canSell: false,
  rangeType: EntityAttackType.None,
  tier: 9,
  gemStatBuff: {
    attack: 70,
    defense: 70,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Corruption],
  gemEntityEffectChance: 75,
  usableEffectDescription: "+70 Attack, +70 Defense, 75% chance to apply Corruption effect each hit.",

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
