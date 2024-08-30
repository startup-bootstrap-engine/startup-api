import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier2Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";

export const itemCorruptionBolt: IEquippableAmmoTier2Blueprint = {
  key: RangedWeaponsBlueprint.CorruptionBolt,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/corruption-bolt.png",
  name: "Corruption Bolt",
  description:
    "An arrow imbued with dark, otherworldly energy. It is said to be able to ignite the air around it and to be capable of piercing even the toughest materials with ease.",
  attack: 22,
  tier: 2,
  weight: 0.013,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  maxStackSize: 9999,
  basePrice: 3,
  canSell: false,
  entityEffects: [EntityEffectBlueprint.Corruption],
  entityEffectChance: 70,
};
