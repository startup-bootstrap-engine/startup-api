import { IEquippableMeleeTier18WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemInfernalSlicer: IEquippableMeleeTier18WeaponBlueprint = {
  key: SwordsBlueprint.InfernalSlicer,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/infernal-slicer.png",
  name: "Infernal Slicer",
  description:
    "Forged in the fires of the underworld, this slicer carries the wrath of demons, cutting through armor and flesh with hellish fury.",
  attack: 133,
  defense: 99,
  tier: 18,
  weight: 1.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 275,
};
