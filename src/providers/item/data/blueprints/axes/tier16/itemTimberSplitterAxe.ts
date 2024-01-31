import { IEquippableMeleeTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemTimberSplitterAxe: IEquippableMeleeTier16WeaponBlueprint = {
  key: AxesBlueprint.TimberSplitterAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/timber-splitter-axe.png",
  name: "Timber Splitter Axe",
  description: "Powerful, wedge-shaped head for efficient log splitting and durable performance.",
  weight: 5.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 115,
  defense: 112,
  tier: 16,
  rangeType: EntityAttackType.Melee,
  basePrice: 140,
};
