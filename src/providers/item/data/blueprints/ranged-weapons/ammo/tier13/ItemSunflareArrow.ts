import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier13Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemSunflareArrow: IEquippableAmmoTier13Blueprint = {
  key: RangedWeaponsBlueprint.SunflareArrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/sunflare-arrow.png",
  name: "Sunflare Arrow",
  description:
    "Infused with the essence of the sun, these arrows burn brightly. Excellent for blinding foes or illuminating dark areas.",
  weight: 0.1,
  maxStackSize: 9999,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 6,
  attack: 93,
  tier: 13,
  canSell: false,
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 100,
};
