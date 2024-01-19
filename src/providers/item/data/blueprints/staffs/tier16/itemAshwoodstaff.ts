import { IEquippableTwoHandedStaffTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  AnimationEffectKeys,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { StaffsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemAshwoodstaff: IEquippableTwoHandedStaffTier16WeaponBlueprint = {
  key: StaffsBlueprint.AshwoodStaff,
  type: ItemType.Weapon,
  subType: ItemSubType.Staff,
  rangeType: EntityAttackType.Ranged,
  projectileAnimationKey: AnimationEffectKeys.Blue,
  textureAtlas: "items",
  texturePath: "staffs/ashwood-staff.png",
  name: "Ashwood Staff",
  description:
    "A magical conduit of ash wood, blending offense and defense, empowering your character's versatile capabilities in-game battles.",
  weight: 1.7,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 114,
  defense: 98,
  tier: 16,
  maxRange: RangeTypes.High,
  basePrice: 217,
  isTwoHanded: true,
};
