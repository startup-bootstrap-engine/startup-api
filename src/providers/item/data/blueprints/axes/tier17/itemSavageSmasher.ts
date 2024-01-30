import { IEquippableMeleeTier17WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSavageSmasher: IEquippableMeleeTier17WeaponBlueprint = {
  key: AxesBlueprint.SavageSmasher,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/savage-smasher.png",
  name: "Savage Smasher",
  description: "Mighty axe, precision design for defeating adversaries decisively",
  weight: 6,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 124,
  defense: 122,
  tier: 17,
  rangeType: EntityAttackType.Melee,
  basePrice: 148,
};
