import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier2Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemEarthArrow: IEquippableAmmoTier2Blueprint = {
  key: RangedWeaponsBlueprint.EarthArrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/earth-arrow.png",
  name: "Earth Arrow",
  description:
    "Infused with the elemental power of Earth, this arrow creates a mini-tremor upon impact. Effective for disrupting enemy formations and unbalancing foes.",
  weight: 0.1,
  maxStackSize: 9999,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 8,
  attack: 22,
  tier: 2,
  canSell: false,
  entityEffects: [EntityEffectBlueprint.VineGrasp],
  entityEffectChance: 70,
};
