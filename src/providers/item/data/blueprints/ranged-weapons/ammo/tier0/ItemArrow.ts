import { IEquippableAmmoTier0Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemArrow: IEquippableAmmoTier0Blueprint = {
  key: RangedWeaponsBlueprint.Arrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/arrow.png",
  name: "Arrow",
  description: "An iron head arrow.",
  attack: 8,
  tier: 0,
  weight: 0.01,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  maxStackSize: 9999,
  basePrice: 1,
  canSell: false,
};
