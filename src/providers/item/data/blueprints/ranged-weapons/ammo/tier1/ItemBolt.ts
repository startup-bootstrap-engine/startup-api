import { IEquippableAmmoTier1Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";

export const itemBolt: IEquippableAmmoTier1Blueprint = {
  key: RangedWeaponsBlueprint.Bolt,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/bolt.png",
  name: "Bolt",
  description: "A crossbow bolt.",
  attack: 14,
  tier: 1,
  weight: 0.04,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  maxStackSize: 9999,
  basePrice: 2,
  canSell: false,
};
