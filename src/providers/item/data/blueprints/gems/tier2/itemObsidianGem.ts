import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableArmorTier2Blueprint } from "../../../types/TierBlueprintTypes";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemObsidianGem: IEquippableArmorTier2Blueprint = {
  key: GemsBlueprint.ObsidianGem,
  type: ItemType.Jewelry,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/obsidian-gem.png",
  name: "Obsidian Gem",
  description: "Dark mystery, sleek elegance, a formidable beauty; harness the strength and allure of obsidian.",
  defense: 20,
  tier: 2,
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 75,
};
