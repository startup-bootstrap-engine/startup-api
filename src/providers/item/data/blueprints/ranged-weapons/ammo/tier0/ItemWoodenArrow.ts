import { IEquippableAmmoTier0Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemWoodenArrow: IEquippableAmmoTier0Blueprint = {
  key: RangedWeaponsBlueprint.WoodenArrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/wooden-arrow.png",
  name: "Training Arrow",
  description: "A pointed wooden stick used with a bow to shoot long-range projectiles.",
  attack: 1,
  tier: 0,
  weight: 0.01,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  maxStackSize: 99999,
  basePrice: 0.05,
  isTraining: true,
  canSell: false,
};
