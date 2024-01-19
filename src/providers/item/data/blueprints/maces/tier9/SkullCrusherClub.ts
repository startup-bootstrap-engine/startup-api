import { IEquippableMeleeTier9WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSkullCrusherClub: IEquippableMeleeTier9WeaponBlueprint = {
  key: MacesBlueprint.SkullCrusherClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/skull-crusher-club.png",
  name: "Skull Crusher Club",
  description: "The Skull Crusher Club combines a stylish appearance with a sense of danger.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 66,
  defense: 59,
  tier: 9,
  rangeType: EntityAttackType.Melee,
};
