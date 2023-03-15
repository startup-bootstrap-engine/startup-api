import { IEquippableArmorBlueprint, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { ArmorsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemPlateArmor: IEquippableArmorBlueprint = {
  key: ArmorsBlueprint.PlateArmor,
  type: ItemType.Armor,
  subType: ItemSubType.Armor,
  textureAtlas: "items",
  texturePath: "armors/plate-armor.png",

  name: "Plate Armor",
  description:
    "A Plate Armor consists of shaped, interlocking metal plates to cover the entire body and articulated to allow mobility.",
  defense: 25,
  weight: 4,
  allowedEquipSlotType: [ItemSlotType.Torso],
  basePrice: 125,
};
