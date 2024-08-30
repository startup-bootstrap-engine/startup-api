import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier2Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemPoisonArrow: IEquippableAmmoTier2Blueprint = {
  key: RangedWeaponsBlueprint.PoisonArrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/poison-arrow.png",
  name: "Poison Arrow",
  description: "An arrow coated with poison.",
  attack: 20,
  tier: 2,
  weight: 0.025,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  maxStackSize: 9999,
  basePrice: 1.5,
  entityEffects: [EntityEffectBlueprint.Poison],
  entityEffectChance: 90,
  canSell: false,
};
