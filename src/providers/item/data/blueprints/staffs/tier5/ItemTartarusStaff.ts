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
import { IEquippableTwoHandedStaffTier5WeaponBlueprint } from "../../../types/TierBlueprintTypes";

export const itemTartarusStaff: IEquippableTwoHandedStaffTier5WeaponBlueprint = {
  key: StaffsBlueprint.TartarusStaff,
  type: ItemType.Weapon,
  subType: ItemSubType.Staff,
  rangeType: EntityAttackType.Ranged,
  projectileAnimationKey: AnimationEffectKeys.Poison,
  textureAtlas: "items",
  texturePath: "staffs/tartarus-staff.png",
  name: "Tartarus Staff",
  description:
    "The Tartarus Staff is a weapon of dark power, imbued with the fiery energy of the underworld. Those who wield the Tartarus Staff must be careful, for its power is as dangerous to the wielder as it is to their foes, and it may consume them if they are not strong enough to master its dark magic.",
  weight: 1.7,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 40,
  defense: 10,
  tier: 5,
  maxRange: RangeTypes.High,
  basePrice: 93,
  isTwoHanded: true,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+10% MaxHealth)",
          deactivation: "You feel the power of max health leaving your body. (-10% MaxHealth)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "The Tartarus Staff grants +10% MaxHealth, +10% MaxMana, +10% Magic, +10% MagicResistance.",
};
