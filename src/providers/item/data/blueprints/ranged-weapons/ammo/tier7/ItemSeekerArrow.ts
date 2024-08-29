import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier7Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemSeekerArrow: IEquippableAmmoTier7Blueprint = {
  key: RangedWeaponsBlueprint.SeekerArrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/seeker-arrow.png",
  name: "Seeker Arrow",
  description: "An arrow that seeks out the target's weak spots. Highly effective for delivering critical hits.",
  weight: 0.1,
  maxStackSize: 9999,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 90,
  basePrice: 8,
  tier: 7,
  attack: 56,
  canSell: false,
};
