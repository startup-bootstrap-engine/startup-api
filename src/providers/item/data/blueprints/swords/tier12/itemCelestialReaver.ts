import { IEquippableMeleeTier12WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCelestialReaver: IEquippableMeleeTier12WeaponBlueprint = {
  key: SwordsBlueprint.CelestialReaver,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/celestial-reaver.png",
  name: "Celestial Reaver",
  description:
    "Forged in the heart of a dying star, this blade pulses with celestial energy, cleaving through darkness with righteous fury.",
  attack: 91,
  defense: 90,
  tier: 12,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 280,
};
