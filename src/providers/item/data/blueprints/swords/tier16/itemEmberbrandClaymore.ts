import { IEquippableMeleeTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemEmberbrandClaymore: IEquippableMeleeTier16WeaponBlueprint = {
  key: SwordsBlueprint.EmberbrandClaymore,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/emberbrand-claymore.png",
  name: "Emberbrand Claymore",
  description:
    "Forged in the heart of volcanic fires, this claymore slices through enemies with searing heat, leaving nothing but ash in its wake.",
  attack: 115,
  defense: 96,
  tier: 16,
  weight: 1.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 220,
};
