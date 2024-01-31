import { IEquippableMeleeTier12WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCleaverAxe: IEquippableMeleeTier12WeaponBlueprint = {
  key: AxesBlueprint.CleaverAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/cleaver-axe.png",
  name: "Cleaver Axe",
  description: "The Cleaver Axe is a virtual powerhouse—a precision blade, formidable for conquerors.",
  weight: 4.1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 89,
  defense: 88,
  tier: 12,
  rangeType: EntityAttackType.Melee,
  basePrice: 113,
};
