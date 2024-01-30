import { IEquippableMeleeTier12WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemHammerCleaveAxe: IEquippableMeleeTier12WeaponBlueprint = {
  key: AxesBlueprint.HammerCleaveAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/hammercleave-axe.png",
  name: "Hammer Cleave Axe",
  description: "The Hammercleave Axe delivers versatile and devastating effects on the battlefield.",
  weight: 4.6,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 92,
  defense: 92,
  tier: 12,
  rangeType: EntityAttackType.Melee,
  basePrice: 120,
};
