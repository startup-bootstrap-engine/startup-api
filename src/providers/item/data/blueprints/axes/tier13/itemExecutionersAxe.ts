import { IEquippableMeleeTier13WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemExecutionersAxe: IEquippableMeleeTier13WeaponBlueprint = {
  key: AxesBlueprint.ExecutionersAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/executioners-axe.png",
  name: "Executioners Axe",
  description: "The Executioner's axe is wielded for impactful and forceful strikes.",
  weight: 4.9,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 96,
  defense: 95,
  tier: 13,
  rangeType: EntityAttackType.Melee,
  basePrice: 125,
};
