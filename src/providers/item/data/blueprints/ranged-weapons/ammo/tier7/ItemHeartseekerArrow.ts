import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier7Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemHeartseekerArrow: IEquippableAmmoTier7Blueprint = {
  key: RangedWeaponsBlueprint.HeartseekerArrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/heartseeker-arrow.png",
  name: "Heartseeker Arrow",
  description: "Enchanted to always find the heart of the target. Highly effective for delivering critical hits.",
  weight: 0.1,
  maxStackSize: 9999,
  tier: 7,
  attack: 52,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 50,
  basePrice: 8,
  canSell: false,
};
