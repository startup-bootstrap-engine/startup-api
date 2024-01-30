import { IEquippableMeleeTier15WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemTwinEdgeAxe: IEquippableMeleeTier15WeaponBlueprint = {
  key: AxesBlueprint.TwinEdgeAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/twin-edge-axe.png",
  name: "Twin Edge Axe",
  description: "Dual blades for swift, powerful, versatile strikes.",
  weight: 5.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 113,
  defense: 110,
  tier: 15,
  rangeType: EntityAttackType.Melee,
  basePrice: 138,
};
