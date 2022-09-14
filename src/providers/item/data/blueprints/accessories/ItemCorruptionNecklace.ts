import { IItem } from "@entities/ModuleInventory/ItemModel";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../types/itemsBlueprintTypes";

export const itemCorruptionNecklace: Partial<IItem> = {
  key: AccessoriesBlueprint.CorruptionNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/corruption-necklace.png",
  textureKey: "accessories",
  name: "Corruption Necklace",
  description: "a neckclace tainted by corrupted energy.",
  attack: 1,
  defense: 0,
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.Accessory],
};