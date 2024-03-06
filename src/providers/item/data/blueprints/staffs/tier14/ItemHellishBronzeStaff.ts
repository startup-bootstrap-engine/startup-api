import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableTwoHandedStaffTier14WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  AnimationEffectKeys,
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { StaffsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemHellishBronzeStaff: IEquippableTwoHandedStaffTier14WeaponBlueprint = {
  key: StaffsBlueprint.HellishBronzeStaff,
  type: ItemType.Weapon,
  subType: ItemSubType.Staff,
  rangeType: EntityAttackType.Ranged,
  projectileAnimationKey: AnimationEffectKeys.Dark,
  textureAtlas: "items",
  texturePath: "staffs/hellish-bronze-staff.png",
  name: "Hellish Bronze Staff",
  description:
    "The Hellish Bronze Staff is primarily a defensive weapon, with a high Defense rating that allows mages to deflect and absorb incoming attacks.",
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 100,
  defense: 60,
  tier: 14,
  isTwoHanded: true,
  maxRange: 7,
  entityEffects: [EntityEffectBlueprint.Poison],
  entityEffectChance: 85,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Strength,
    buffPercentage: 5,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of strength flowing through your body. (+7% strength)",
        deactivation: "You feel the power of strength leaving your body. (-7% strength)",
      },
    },
  },
  equippedBuffDescription: "Increases strength by 7%",
};
