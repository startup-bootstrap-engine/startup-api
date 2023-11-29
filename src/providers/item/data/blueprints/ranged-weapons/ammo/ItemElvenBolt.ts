import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IEquippableRangedAmmoBlueprint, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";

export const itemElvenBolt: IEquippableRangedAmmoBlueprint = {
  key: RangedWeaponsBlueprint.ElvenBolt,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/elven-bolt.png",
  name: "Elven Bolt",
  description:
    "A poisonous arrow crafted by the elves, known for their skill in archery. It is said to be incredibly accurate and able to pierce even the toughest armor.",
  attack: 16,
  weight: 0.03,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  maxStackSize: 999,
  basePrice: 7,
  canSell: false,
  entityEffects: [EntityEffectBlueprint.Poison],
  entityEffectChance: 70,
};
