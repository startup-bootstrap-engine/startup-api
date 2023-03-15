import { EntityAttackType, IEquippableWeaponBlueprint, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SpearsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemjavelin: IEquippableWeaponBlueprint = {
  key: SpearsBlueprint.Javelin,
  type: ItemType.Weapon,
  subType: ItemSubType.Spear,
  textureAtlas: "items",
  texturePath: "spears/javelin.png",
  name: "javelin",
  description:
    "A type of spear designed for throwing, used in ancient Greek and Roman warfare. It has a slender, streamlined design that allows it to be thrown with great accuracy and force.",
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 14,
  defense: 4,
  isTwoHanded: true,
  rangeType: EntityAttackType.Ranged,
  basePrice: 75,
};
