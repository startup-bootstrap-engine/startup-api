import { IEquippableMeleeTier9WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemThunderStrikeClub: IEquippableMeleeTier9WeaponBlueprint = {
  key: MacesBlueprint.ThunderStrikeClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/thunder-strike-club.png",
  name: "Thunder Strike Club",
  description: "Thunder Strike Club crushes bones and fills the sky.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 71,
  defense: 67,
  tier: 9,
  rangeType: EntityAttackType.Melee,
};
