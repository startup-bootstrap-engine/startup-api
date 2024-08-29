import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier14Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemPlasmaPierceArrow: IEquippableAmmoTier14Blueprint = {
  key: RangedWeaponsBlueprint.PlasmaPierceArrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/plasma-pierce-arrow.png",
  name: "Plasma Pierce Arrow",
  description: "Packed with charged plasma, this arrow electrifies and burns its victims simultaneously..",
  attack: 106,
  tier: 14,
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  maxStackSize: 9999,
  basePrice: 27,
  entityEffects: [EntityEffectBlueprint.Burning, EntityEffectBlueprint.Bleeding],
  entityEffectChance: 100,
  canSell: false,
};
