import { IEquippableMeleeTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemRoyalChopperAxe: IEquippableMeleeTier16WeaponBlueprint = {
  key: AxesBlueprint.RoyalChopperAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/royal-chopper-axe.png",
  name: "Royal Chopper Axe",
  description: "The Ironclad Cleaver axe commands respect with its sharp, imposing presence.",
  weight: 5.8,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 120,
  defense: 118,
  tier: 16,
  rangeType: EntityAttackType.Melee,
  basePrice: 144,
};
