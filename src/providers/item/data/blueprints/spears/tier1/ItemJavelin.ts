import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableTwoHandedTier1WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { SpearsBlueprint } from "../../../types/itemsBlueprintTypes";

// TODO: Make this a one handed ranged weapon
export const itemjavelin: IEquippableTwoHandedTier1WeaponBlueprint = {
  key: SpearsBlueprint.Javelin,
  type: ItemType.Weapon,
  subType: ItemSubType.Spear,
  textureAtlas: "items",
  texturePath: "spears/javelin.png",
  name: "javelin",
  description: "A type of spear used in ancient Greek and Roman warfare.",
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 20,
  defense: 8,
  tier: 1,
  isTwoHanded: true,
  rangeType: EntityAttackType.Melee,
  basePrice: 75,
};
