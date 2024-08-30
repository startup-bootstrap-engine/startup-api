import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier2Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";

export const itemElvenBolt: IEquippableAmmoTier2Blueprint = {
  key: RangedWeaponsBlueprint.ElvenBolt,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/elven-bolt.png",
  name: "Elven Bolt",
  description:
    "A poisonous arrow crafted by the elves, known for their skill in archery. It is said to be incredibly accurate and able to pierce even the toughest armor.",
  attack: 20,
  tier: 2,
  weight: 0.03,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  maxStackSize: 9999,
  basePrice: 7,
  canSell: false,
  entityEffects: [EntityEffectBlueprint.Poison],
  entityEffectChance: 70,
};
