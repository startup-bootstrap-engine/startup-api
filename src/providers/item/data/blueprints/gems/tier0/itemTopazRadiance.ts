import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableArmorTier0Blueprint } from "../../../types/TierBlueprintTypes";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemTopazRadiance: IEquippableArmorTier0Blueprint = {
  key: GemsBlueprint.TopazRadiance,
  type: ItemType.Jewelry,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/topaz-radiance.png",
  name: "Topaz Radiance Gem",
  description: "Shiny gold gem, clear and bright, like a sunny spark in a picture.",
  defense: 5,
  tier: 0,
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 40,
};
