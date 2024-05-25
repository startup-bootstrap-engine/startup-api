import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableTwoHandedStaffTier10WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemOracleStaff: IEquippableTwoHandedStaffTier10WeaponBlueprint = {
  key: StaffsBlueprint.OracleStaff,
  type: ItemType.Weapon,
  subType: ItemSubType.Staff,
  rangeType: EntityAttackType.Ranged,
  projectileAnimationKey: AnimationEffectKeys.Energy,
  textureAtlas: "items",
  texturePath: "staffs/oracle-staff.png",
  name: "Oracle Staff",
  description:
    "Carved with intricate symbols of foresight and divination, this staff grants its wielder glimpses of the future.",
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 76,
  defense: 39,
  tier: 10,
  maxRange: RangeTypes.High,
  basePrice: 190,
  isTwoHanded: true,
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 85,
};