import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableArmorTier0Blueprint } from "../../../types/TierBlueprintTypes";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemEmeraldGem: IEquippableArmorTier0Blueprint = {
  key: GemsBlueprint.EmeraldGem,
  type: ItemType.Jewelry,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/emerald-gem.png",
  name: "Emerald Gem",
  description: "Bright green, clear, and dazzling; a stunning and natural beauty in a picture.",
  defense: 3,
  tier: 0,
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 37,
};
