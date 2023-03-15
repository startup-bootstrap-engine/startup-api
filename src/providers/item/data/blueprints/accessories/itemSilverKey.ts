import { IEquippableItemBlueprint, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemSilverKey: IEquippableItemBlueprint = {
  key: AccessoriesBlueprint.SilverKey,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "others/silver-key.png",
  name: "Silver Key",
  description: "A well made silver key.",
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 1,
};
