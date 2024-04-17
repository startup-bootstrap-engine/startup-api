import { IBaseItemContainerBlueprint, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { ContainersBlueprint } from "../../types/itemsBlueprintTypes";

export const itemHuntersBackpack: Partial<IBaseItemContainerBlueprint> = {
  key: ContainersBlueprint.HuntersBackpack,
  type: ItemType.Container,
  subType: ItemSubType.Other,
  textureAtlas: "items",
  texturePath: "containers/hunters-backpack.png",
  name: "Hunters Backpack",
  description:
    "You see a hunters backpack. It has been made using sturdy materials, perfect for long hunting trips. It has a total of 45 slots.",
  weight: 3,
  canSell: false,
  isItemContainer: true,
  generateContainerSlots: 45,
  allowedEquipSlotType: [ItemSlotType.Inventory],
};
