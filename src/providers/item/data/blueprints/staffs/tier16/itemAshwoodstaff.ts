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
  entityEffects: [EntityEffectBlueprint.Poison, EntityEffectBlueprint.Burning],
  entityEffectChance: 100,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 12,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+12% strength)",
          deactivation: "You feel the power of strength leaving your body. (-12% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+5% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-5% resistance)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 12% and resistance by 7%",
};
