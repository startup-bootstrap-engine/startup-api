import { IEquippableMeleeTier8WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemStoneFangCleaverClub: IEquippableMeleeTier8WeaponBlueprint = {
  key: MacesBlueprint.StonefangCleaverClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/stonefang-cleaver-club.png",
  name: "Stonefang Cleaver Club",
  description: "Infused with ferocity, this weapon is designed to deliver devastating blows with unrivaled force.",
  weight: 4.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 58,
  defense: 52,
  tier: 8,
  rangeType: EntityAttackType.Melee,
};
