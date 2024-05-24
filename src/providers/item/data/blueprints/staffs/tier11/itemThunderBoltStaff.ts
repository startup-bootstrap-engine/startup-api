import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableTwoHandedStaffTier11WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  AnimationEffectKeys,
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { StaffsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemThunderBoltStaff: IEquippableTwoHandedStaffTier11WeaponBlueprint = {
  key: StaffsBlueprint.ThunderBoltStaff,
  type: ItemType.Weapon,
  subType: ItemSubType.Staff,
  rangeType: EntityAttackType.Ranged,
  projectileAnimationKey: AnimationEffectKeys.Energy,
  textureAtlas: "items",
  texturePath: "staffs/thunder-bolt-staff.png",
  name: "Thunder Bolt Staff",
  description:
    "Forged in the heart of a lightning storm and imbued with the power of thunder, this staff commands the fury of the skies.",
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 83,
  defense: 42,
  tier: 11,
  maxRange: RangeTypes.High,
  basePrice: 190,
  isTwoHanded: true,
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 85,
};
