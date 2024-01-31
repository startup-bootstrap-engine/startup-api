import { IEquippableMeleeTier17WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemButterflierAxe: IEquippableMeleeTier17WeaponBlueprint = {
  key: AxesBlueprint.ButterflierAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/butterflier-axe.png",
  name: "Butterflier Axe",
  description: "A nimble, deadly weapon for swift triumph over adversaries.",
  weight: 5.8,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 122,
  defense: 120,
  tier: 17,
  rangeType: EntityAttackType.Melee,
  basePrice: 145,
};
