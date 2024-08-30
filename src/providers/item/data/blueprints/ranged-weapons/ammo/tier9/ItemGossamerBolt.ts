import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier9Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemGossamerBolt: IEquippableAmmoTier9Blueprint = {
  key: RangedWeaponsBlueprint.GossamerBolt,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/gossamer-bolt.png",
  name: "Gossamer Bolt",
  description:
    "Made from spider silk and lightweight materials and poison, these bolts are silent but deadly, perfect for assassinations.",
  weight: 0.1,
  maxStackSize: 9999,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 8,
  tier: 9,
  attack: 68,
  canSell: false,
  entityEffects: [EntityEffectBlueprint.Poison],
  entityEffectChance: 70,
};
