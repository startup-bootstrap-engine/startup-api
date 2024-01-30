import { IEquippableMeleeTier14WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemMaulAxe: IEquippableMeleeTier14WeaponBlueprint = {
  key: AxesBlueprint.MaulAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/maul-axe.png",
  name: "Maul Axe",
  description: "Heavy, brutal force, designed for powerful and impactful strikes.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 101,
  defense: 100,
  tier: 14,
  rangeType: EntityAttackType.Melee,
  basePrice: 130,
};
