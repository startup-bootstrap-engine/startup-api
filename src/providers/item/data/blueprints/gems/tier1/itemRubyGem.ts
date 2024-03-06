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
  basePrice: 50,
  canSell: false,
  rangeType: EntityAttackType.None,
  useWithItemEffect: async (originItem, targetItem, character) => {
    // Add your custom logic here
  },
};
