import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier12Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemGoldenArrow: IEquippableAmmoTier12Blueprint = {
  key: RangedWeaponsBlueprint.GoldenArrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/golden-arrow.png",
  name: "Golden Arrow",
  description: "An arrow made of pure gold that deals extra damage to enemies weak to gold.",
  attack: 86,
  tier: 12,
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  maxStackSize: 9999,
  basePrice: 3,
  canSell: false,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 100,
};
