import { IEquippableMeleeTier17WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemFrostfireLongblade: IEquippableMeleeTier17WeaponBlueprint = {
  key: SwordsBlueprint.FrostfireLongblade,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/frostfire-longblade.png",
  name: "Frostfire Longblade",
  description:
    "Crafted from enchanted ice and engulfed in mystical flames, this longblade wields the power of both fire and ice, leaving destruction in its wake.",
  attack: 122,
  defense: 100,
  tier: 17,
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 260,
};
