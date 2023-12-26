import { IEquippableArmorTier9Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { ShieldsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemEmeraldShield: IEquippableArmorTier9Blueprint = {
  key: ShieldsBlueprint.EmeraldShield,
  type: ItemType.Armor,
  subType: ItemSubType.Shield,
  textureAtlas: "items",
  texturePath: "shields/emerald-shield.png",
  name: "Emerald Shield",
  description: "A shield made from pure emerald, providing excellent defense and a touch of elegance to the bearer.",
  weight: 2,
  defense: 71,
  tier: 9,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
};
