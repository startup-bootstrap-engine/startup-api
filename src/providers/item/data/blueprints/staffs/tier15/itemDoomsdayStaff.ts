import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableTwoHandedStaffTier15WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  AnimationEffectKeys,
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { StaffsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemDoomsdayStaff: IEquippableTwoHandedStaffTier15WeaponBlueprint = {
  key: StaffsBlueprint.DoomsdayStaff,
  type: ItemType.Weapon,
  subType: ItemSubType.Staff,
  rangeType: EntityAttackType.Ranged,
  projectileAnimationKey: AnimationEffectKeys.Energy,
  textureAtlas: "items",
  texturePath: "staffs/doomsday-staff.png",
  name: "Doomsday Staff",
  description:
    "Crafted by the dark sorcerers of old, this staff embodies the impending cataclysm with its sinister aura.",
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 111,
  defense: 85,
  tier: 15,
  maxRange: RangeTypes.High,
  basePrice: 190,
  isTwoHanded: true,
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Burning],
  entityEffectChance: 95,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.Speed,
      buffPercentage: 4,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases magic by 10% and speed by 4%",
};
