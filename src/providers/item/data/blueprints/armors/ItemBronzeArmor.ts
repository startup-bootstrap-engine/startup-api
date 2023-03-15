import { IEquippableArmorBlueprint, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { ArmorsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemBronzeArmor: IEquippableArmorBlueprint = {
  key: ArmorsBlueprint.BronzeArmor,
  type: ItemType.Armor,
  subType: ItemSubType.Armor,
  textureAtlas: "items",
  texturePath: "armors/bronze-armor.png",
  name: "Bronze Armor",
  description: "A bronze plated armor.",
  defense: 18,
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.Torso],
  basePrice: 97,
};
