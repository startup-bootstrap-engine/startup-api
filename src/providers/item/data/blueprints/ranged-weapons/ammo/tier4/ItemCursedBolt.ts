import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier4Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemCursedBolt: IEquippableAmmoTier4Blueprint = {
  key: RangedWeaponsBlueprint.CursedBolt,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/cursed-bolt.png",
  name: "Cursed Bolt",
  description: "Imbued with a dark hex that curses enemies upon impact. The curse reduces enemy stats temporarily.",
  weight: 0.1,
  maxStackSize: 9999,
  tier: 4,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 8,
  attack: 32,
  canSell: false,
  entityEffects: [EntityEffectBlueprint.Corruption],
  entityEffectChance: 70,
};
