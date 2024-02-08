import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableArmorTier2Blueprint } from "../../../types/TierBlueprintTypes";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemEarthstoneGem: IEquippableArmorTier2Blueprint = {
  key: GemsBlueprint.EarthstoneGem,
  type: ItemType.Jewelry,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/earthstone-gem.png",
  name: "Earthstone Gem",
  description: "Nature's embrace, earthly hues, timeless energy; a grounding and enchanting essence in gem form.",
  defense: 18,
  tier: 2,
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 70,
};
