import { IEquippableAmmoTier1Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";

export const itemIronArrow: IEquippableAmmoTier1Blueprint = {
  key: RangedWeaponsBlueprint.IronArrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/iron-arrow.png",
  name: "Iron Arrow",
  description: "Description",
  weight: 0.06,
  maxStackSize: 9999,
  tier: 1,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 3,
  attack: 11,
  canSell: false,
};
