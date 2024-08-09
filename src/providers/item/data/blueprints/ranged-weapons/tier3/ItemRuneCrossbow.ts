import { EntityAttackType, ItemSlotType, ItemSubType, ItemType, RangeTypes } from "@rpg-engine/shared";
import { IEquippableRangedTier3WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { RangedWeaponsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemRuneCrossbow: IEquippableRangedTier3WeaponBlueprint = {
  key: RangedWeaponsBlueprint.RuneCrossbow,
  type: ItemType.Weapon,
  rangeType: EntityAttackType.Ranged,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/rune-crossbow.png",
  name: "Rune Crossbow",
  description: "A crossbow with rune inscriptions that increases attack speed and accuracy.",
  attack: 36,
  tier: 3,
  weight: 7,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  maxRange: RangeTypes.High,
  requiredAmmoKeys: [RangedWeaponsBlueprint.Bolt, RangedWeaponsBlueprint.ElvenBolt, RangedWeaponsBlueprint.FireBolt],
  isTwoHanded: true,
  basePrice: 100,
};
