import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableArmorTier1Blueprint } from "../../../types/TierBlueprintTypes";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemRubyGem: IEquippableArmorTier1Blueprint = {
  key: GemsBlueprint.RubyGem,
  type: ItemType.Jewelry,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/ruby-gem.png",
  name: "Ruby Gem",
  description: "Vibrant red charm, clear brilliance; a timeless and captivating beauty in this precious jewel.",
  defense: 9,
  tier: 1,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 50,
};
