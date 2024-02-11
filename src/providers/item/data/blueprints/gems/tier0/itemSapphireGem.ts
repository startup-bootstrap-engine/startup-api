import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableArmorTier0Blueprint } from "../../../types/TierBlueprintTypes";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSapphireGem: IEquippableArmorTier0Blueprint = {
  key: GemsBlueprint.SapphireGem,
  type: ItemType.Jewelry,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/sapphire-gem.png",
  name: "Sapphire Gem",
  description: "Deep blue allure, clear brilliance, timeless elegance captured in the essence of this precious stone.",
  defense: 7,
  tier: 0,
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 45,
};
