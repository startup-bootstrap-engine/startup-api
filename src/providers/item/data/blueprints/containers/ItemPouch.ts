import { IItem } from "@entities/ModuleInventory/ItemModel";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { ContainersBlueprint } from "../../types/itemsBlueprintTypes";

export const itemPouch: Partial<IItem> = {
  key: ContainersBlueprint.Pouch,
  type: ItemType.Container,
  subType: ItemSubType.Other,
  textureAtlas: "items",
  texturePath: "containers/pouch.png",

  name: "Pouch",
  description: "You see a pouch. It is made of leather and has 5 total slots.",
  weight: 0.5,
  isItemContainer: true,
  generateContainerSlots: 5,
  allowedEquipSlotType: [ItemSlotType.Inventory],
  basePrice: 0,
};
