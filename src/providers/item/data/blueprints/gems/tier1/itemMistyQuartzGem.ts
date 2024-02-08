import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableArmorTier1Blueprint } from "../../../types/TierBlueprintTypes";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemMistyQuartzGem: IEquippableArmorTier1Blueprint = {
  key: GemsBlueprint.MistyQuartzGem,
  type: ItemType.Jewelry,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/misty-quartz-gem.png",
  name: "Misty Quartz Gem",
  description: "Soft misty charm, subtle clarity; a serene and enchanting beauty in this unique gem.",
  defense: 11,
  tier: 1,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 55,
};
