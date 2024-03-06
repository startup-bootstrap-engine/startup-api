import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableTwoHandedStaffTier13WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemLunarWand: IEquippableTwoHandedStaffTier13WeaponBlueprint = {
  key: StaffsBlueprint.LunarWand,
  type: ItemType.Weapon,
  subType: ItemSubType.Staff,
  rangeType: EntityAttackType.Ranged,
  projectileAnimationKey: AnimationEffectKeys.QuickFire,
  textureAtlas: "items",
  texturePath: "staffs/lunar-wand.png",
  name: "Lunar Wand",
  description:
    "Infused with the essence of the moon, this wand grants unique abilities that change with the lunar phases. Potency varies throughout the month.",
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 98,
  defense: 62,
  tier: 13,
  maxRange: RangeTypes.High,
  basePrice: 180,
  isTwoHanded: true,
  entityEffects: [EntityEffectBlueprint.Corruption],
  entityEffectChance: 85,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Magic,
    buffPercentage: 5,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of magic flowing through your body. (+5% magic)",
        deactivation: "You feel the power of magic leaving your body. (-5% magic)",
      },
    },
  },
  equippedBuffDescription: "Increases magic by 5%",
};
