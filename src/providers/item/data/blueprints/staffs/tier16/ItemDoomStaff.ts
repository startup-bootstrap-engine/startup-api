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

export const itemDoomStaff: IEquippableTwoHandedStaffTier16WeaponBlueprint = {
  key: StaffsBlueprint.DoomStaff,
  type: ItemType.Weapon,
  subType: ItemSubType.Staff,
  rangeType: EntityAttackType.Ranged,
  projectileAnimationKey: AnimationEffectKeys.FireBall,
  textureAtlas: "items",
  texturePath: "staffs/doom-staff.png",
  name: "Doom Staff",
  description:
    "Carved from obsidian and crowned with a skull, this staff is a harbinger of doom. Capable of casting curses that weaken enemies over time.",
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 118,
  defense: 100,
  tier: 16,
  maxRange: RangeTypes.High,
  basePrice: 220,
  isTwoHanded: true,
  entityEffects: [EntityEffectBlueprint.Poison, EntityEffectBlueprint.Corruption],
  entityEffectChance: 105,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+15% strength)",
          deactivation: "You feel the power of strength leaving your body. (-15% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+10% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-10% resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of magic flowing through your body. (+10% magic)",
          deactivation: "You feel the power of magic leaving your body. (-10% magic)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 15%, resistance by 10% and magic by 10%",
};
