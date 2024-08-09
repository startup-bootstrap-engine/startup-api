import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  CombatSkill,
  ItemSlotType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { IEquippableRangedTier4WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { RangedWeaponsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemRoyalCrossbow: IEquippableRangedTier4WeaponBlueprint = {
  key: RangedWeaponsBlueprint.RoyalCrossbow,
  type: ItemType.Weapon,
  rangeType: EntityAttackType.Ranged,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/royal-crossbow.png",
  name: "Royal Crossbow",
  description:
    "A powerful, ornate crossbow often given as a symbol of royal power. It is often made of gold or other precious materials and may be intricately decorated with engravings or gemstones. It has a horizontal limb assembly mounted on a stock that fires projectiles using a horizontal bow-like string.",
  weight: 4,
  attack: 43,
  tier: 4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  maxRange: RangeTypes.High,
  requiredAmmoKeys: [
    RangedWeaponsBlueprint.Bolt,
    RangedWeaponsBlueprint.ElvenBolt,
    RangedWeaponsBlueprint.FireBolt,
    RangedWeaponsBlueprint.CorruptionBolt,
  ],
  isTwoHanded: true,
  basePrice: 95,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Distance,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of distance flowing through your body. (+10% distance)",
          deactivation: "You feel the power of distance leaving your body. (-10% distance)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.Speed,
      buffPercentage: 3,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of speed flowing through your body. (+3% speed)",
          deactivation: "You feel the power of speed leaving your body. (-3% speed)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases distance by 10% and speed by 3% respectively",
};
