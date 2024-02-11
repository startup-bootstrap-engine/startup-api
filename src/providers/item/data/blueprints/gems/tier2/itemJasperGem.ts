import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableArmorTier2Blueprint } from "../../../types/TierBlueprintTypes";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemJasperGem: IEquippableArmorTier2Blueprint = {
  key: GemsBlueprint.JasperGem,
  type: ItemType.Jewelry,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/jasper-gem.png",
  name: "Jasper Gem",
  description: "Rustic allure, nature's palette, a mystical touch; embody the essence of adventure.",
  defense: 15,
  tier: 2,
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 65,
};
