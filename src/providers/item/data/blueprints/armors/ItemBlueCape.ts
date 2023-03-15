import { IEquippableArmorBlueprint, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { ArmorsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemBlueCape: IEquippableArmorBlueprint = {
  key: ArmorsBlueprint.BlueCape,
  type: ItemType.Armor,
  subType: ItemSubType.Armor,
  textureAtlas: "items",
  texturePath: "armors/blue-cape.png",

  name: "Blue Cape",
  description:
    "Crafted from fine materials such as silk or velvet and dyed a deep shade of blue, the Blue Cape is often adorned with symbols of magic or runes. It is said that the cape shimmers with an otherworldly light, resonating with the power of arcane forces.",
  defense: 14,
  weight: 0.8,
  allowedEquipSlotType: [ItemSlotType.Torso],
  basePrice: 90,
};
