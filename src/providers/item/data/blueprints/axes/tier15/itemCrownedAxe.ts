import { IEquippableMeleeTier15WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCrownedAxe: IEquippableMeleeTier15WeaponBlueprint = {
  key: AxesBlueprint.CrownedAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/crowned-axe.png",
  name: "Crowned Axe",
  description: "Majestic design, regal power, a symbol of authority.",
  weight: 5.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 109,
  defense: 107,
  tier: 15,
  rangeType: EntityAttackType.Melee,
  basePrice: 134,
};
