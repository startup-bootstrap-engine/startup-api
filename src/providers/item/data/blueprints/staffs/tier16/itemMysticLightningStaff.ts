import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableTwoHandedStaffTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemMysticLightningStaff: IEquippableTwoHandedStaffTier16WeaponBlueprint = {
  key: StaffsBlueprint.MysticLightningStaff,
  type: ItemType.Weapon,
  subType: ItemSubType.Staff,
  rangeType: EntityAttackType.Ranged,
  projectileAnimationKey: AnimationEffectKeys.Energy,
  textureAtlas: "items",
  texturePath: "staffs/mystic-lightning-staff.png",
  name: "Mystic Lightning Staff",
  description:
    "Forged from ancient thunderstones and imbued with the essence of storms, this staff crackles with raw power.",
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 105,
  defense: 70,
  tier: 16,
  maxRange: RangeTypes.High,
  basePrice: 190,
  isTwoHanded: true,
  entityEffects: [EntityEffectBlueprint.Poison, EntityEffectBlueprint.Corruption],
  entityEffectChance: 105,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases magic by 15% and magic resistance by 10%",
};
