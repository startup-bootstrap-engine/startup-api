import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier4Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemCrystallineArrow: IEquippableAmmoTier4Blueprint = {
  key: RangedWeaponsBlueprint.CrystallineArrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/crystalline-arrow.png",
  name: "Crystalline Arrow",
  description:
    "Forged from magical crystals, this arrow shimmers in multiple colors. It releases a burst of arcane energy upon impact, dealing bonus magical damage.",
  weight: 0.1,
  maxStackSize: 9999,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 6,
  attack: 35,
  tier: 4,
  canSell: false,
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 70,
};
