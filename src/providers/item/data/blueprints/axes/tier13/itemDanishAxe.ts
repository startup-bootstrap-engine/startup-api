import { IEquippableMeleeTier13WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemDanishAxe: IEquippableMeleeTier13WeaponBlueprint = {
  key: AxesBlueprint.DanishAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/danish-axe.png",
  name: "Danish Axe",
  description: "The Danish Axe features a formidable design, a long curved blade, and versatility in medieval combat.",
  weight: 4.9,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 99,
  defense: 99,
  tier: 13,
  rangeType: EntityAttackType.Melee,
  basePrice: 127,
};
