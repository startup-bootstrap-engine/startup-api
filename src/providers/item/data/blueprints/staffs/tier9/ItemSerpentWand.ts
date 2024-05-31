import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableTwoHandedStaffTier9WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemSerpentWand: IEquippableTwoHandedStaffTier9WeaponBlueprint = {
  key: StaffsBlueprint.SerpentWand,
  type: ItemType.Weapon,
  subType: ItemSubType.Staff,
  rangeType: EntityAttackType.Ranged,
  projectileAnimationKey: AnimationEffectKeys.Poison,
  textureAtlas: "items",
  texturePath: "staffs/serpent-wand.png",
  name: "Serpent Wand",
  description:
    "Carved in the likeness of a coiling snake, this wand is imbued with venom. Capable of poisoning enemies over time.",
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 66,
  defense: 24,
  tier: 9,
  maxRange: RangeTypes.High,
  basePrice: 130,
  isTwoHanded: true,
  entityEffects: [EntityEffectBlueprint.VineGrasp, EntityEffectBlueprint.Poison],
  entityEffectChance: 85,

  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 25,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 8,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "The Serpent Wand grants +25% MaxMana, +8% Magic.",
};
