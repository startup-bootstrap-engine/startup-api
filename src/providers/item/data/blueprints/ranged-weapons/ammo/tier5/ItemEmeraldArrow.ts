import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier5Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemEmeraldArrow: IEquippableAmmoTier5Blueprint = {
  key: RangedWeaponsBlueprint.EmeraldArrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/emerald-arrow.png",
  name: "Emerald Arrow",
  description: "An arrow adorned with a gleaming emerald gem.",
  attack: 37,
  weight: 0.1,
  tier: 5,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  maxStackSize: 9999,
  basePrice: 8,
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 80,
  canSell: false,
};
