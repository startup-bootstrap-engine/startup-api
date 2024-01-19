import { IEquippableMeleeTier9WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSunderingClub: IEquippableMeleeTier9WeaponBlueprint = {
  key: MacesBlueprint.SunderingClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/sundering-club.png",
  name: "Sundering Club",
  description: "The Sundering Club evokes a potent magical object capable of immense destruction.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 71,
  defense: 60,
  tier: 9,
  rangeType: EntityAttackType.Melee,
};
