import { IEquippableAmmoTier8Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemWardenArrow: IEquippableAmmoTier8Blueprint = {
  key: RangedWeaponsBlueprint.WardenArrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/warden-arrow.png",
  name: "Warden Arrow",
  description:
    "Designed by skilled rangers, these arrows mark the target, making it easier for allies to focus their attacks.",
  weight: 0.08,
  tier: 8,
  maxStackSize: 9999,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 5,
  attack: 58,
  canSell: false,
};
