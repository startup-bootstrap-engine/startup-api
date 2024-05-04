import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { UseWithGem } from "@providers/useWith/abstractions/UseWithGem";
import { EntityAttackType, IItemGem, ItemSubType, ItemType, RangeTypes } from "@rpg-engine/shared";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemEmeraldGem: IItemGem = {
  key: GemsBlueprint.EmeraldGem,
  type: ItemType.Tool,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/emerald-gem.png",
  name: "Emerald Gem",
  description: "Bright green, clear, and dazzling; a stunning and natural beauty in a picture.",
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  weight: 1.5,
  basePrice: 300,
  canSell: false,
  rangeType: EntityAttackType.None,
  gemStatBuff: {
    attack: 5,
    defense: 3,
  },
  gemEntityEffectsAdd: [EntityEffectBlueprint.Poison],
  gemEntityEffectChance: 60,

  useWithItemEffect: async (originItem, targetItem, character) => {
    const useWithGem = container.get<UseWithGem>(UseWithGem);

    await useWithGem.execute(originItem, targetItem, character);
  },
};
