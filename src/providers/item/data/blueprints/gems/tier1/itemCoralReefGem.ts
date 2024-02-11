import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableArmorTier1Blueprint } from "../../../types/TierBlueprintTypes";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCoralReefGem: IEquippableArmorTier1Blueprint = {
  key: GemsBlueprint.CoralReefGem,
  type: ItemType.Jewelry,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/coral-reef-gem.png",
  name: "Coral Reef Gem",
  description: "Tropical coral tones, vivid clarity; a vibrant and nature-inspired beauty in this unique gem.",
  defense: 15,
  tier: 1,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 60,
};
