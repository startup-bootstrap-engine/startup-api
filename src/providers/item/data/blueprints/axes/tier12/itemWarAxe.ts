import { IEquippableMeleeTier12WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemWarAxe: IEquippableMeleeTier12WeaponBlueprint = {
  key: AxesBlueprint.WarAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/war-axe.png",
  name: "War Axe",
  description: "The war axe is robust, featuring a sharp edge for formidable close combat.",
  weight: 3.8,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 87,
  defense: 86,
  tier: 12,
  rangeType: EntityAttackType.Melee,
  basePrice: 110,
};
