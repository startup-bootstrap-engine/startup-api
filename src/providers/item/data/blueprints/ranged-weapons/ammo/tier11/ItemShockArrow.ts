import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier11Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";

export const itemShockArrow: IEquippableAmmoTier11Blueprint = {
  key: RangedWeaponsBlueprint.ShockArrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/shock-arrow.png",
  name: "Shock Arrow",
  description: "An arrow with sharp blades that can cause bleeding.",
  attack: 79,
  tier: 11,
  weight: 0.05,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  maxStackSize: 9999,
  basePrice: 2,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 100,
  canSell: false,
};
