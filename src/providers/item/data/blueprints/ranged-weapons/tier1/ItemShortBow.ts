import { ItemSlotType, ItemSubType, ItemType, RangeTypes } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { IEquippableRangedTier1WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { RangedWeaponsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemShortBow: IEquippableRangedTier1WeaponBlueprint = {
  key: RangedWeaponsBlueprint.ShortBow,
  type: ItemType.Weapon,
  rangeType: EntityAttackType.Ranged,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/short-bow.png",
  name: "Short Bow",
  description:
    "A small, lightweight bow with a short limb and a short string. It is easy to handle and use, making it popular among beginners and skilled archers alike.",
  attack: 15,
  tier: 1,
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  maxRange: RangeTypes.Short,
  requiredAmmoKeys: [RangedWeaponsBlueprint.Arrow, RangedWeaponsBlueprint.IronArrow],
  isTwoHanded: true,
  basePrice: 65,
};
