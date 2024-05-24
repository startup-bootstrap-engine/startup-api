import { IEquippableMeleeTier13WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemWyvernSlayer: IEquippableMeleeTier13WeaponBlueprint = {
  key: AxesBlueprint.WyvernSlayer,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/wyvern-slayer.png",
  name: "Wyvern Slayer",
  description: "A fearsome axe forged to bring down the mighty wyverns of the skies.",
  weight: 4.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 96,
  defense: 96,
  tier: 13,
  rangeType: EntityAttackType.Melee,
  basePrice: 129,
};
