import { IItem } from "@entities/ModuleInventory/ItemModel";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { LegsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemGoldenLegs: Partial<IItem> = {
  key: LegsBlueprint.GoldenLegs,
  type: ItemType.Armor,
  subType: ItemSubType.Legs,
  textureAtlas: "items",
  texturePath: "legs/golden-legs.png",
  name: "Golden Legs",
  description: "A Leg armor made of gold.",
  weight: 2,
  defense: 14,
  allowedEquipSlotType: [ItemSlotType.Legs],
  basePrice: 60,
};