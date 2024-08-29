import { IEquippableRangedAmmoBlueprint, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemStone: IEquippableRangedAmmoBlueprint = {
  key: RangedWeaponsBlueprint.Stone,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/stone.png",
  name: "Stone",
  description: "A stone. You can easily get more by using your pick on a rock.",
  attack: 4,
  weight: 0.01,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  maxStackSize: 9999,
  basePrice: 3,
  canSell: true,
};
