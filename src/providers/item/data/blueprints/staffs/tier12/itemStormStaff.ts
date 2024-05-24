import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableTwoHandedStaffTier12WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemStormStaff: IEquippableTwoHandedStaffTier12WeaponBlueprint = {
  key: StaffsBlueprint.StormStaff,
  type: ItemType.Weapon,
  subType: ItemSubType.Staff,
  rangeType: EntityAttackType.Ranged,
  projectileAnimationKey: AnimationEffectKeys.Energy,
  textureAtlas: "items",
  texturePath: "staffs/storm-staff.png",
  name: "Storm Staff",
  description:
    "Carved from the heartwood of ancient tempest trees, this staff crackles with the power of thunderstorms.",
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 91,
  defense: 55,
  tier: 12,
  maxRange: RangeTypes.High,
  basePrice: 190,
  isTwoHanded: true,
  entityEffects: [EntityEffectBlueprint.Freezing],
  entityEffectChance: 80,
};
