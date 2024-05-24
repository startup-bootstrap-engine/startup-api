import { IEquippableMeleeTier12WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemPhoenixFury: IEquippableMeleeTier12WeaponBlueprint = {
  key: SwordsBlueprint.PhoenixFury,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/phoenix-fury.png",
  name: "Phoenix Fury",
  description:
    "Forged from the flames of a phoenix's rebirth, this blade burns with undying fire, consuming all in its path.",
  attack: 89,
  defense: 92,
  tier: 12,
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 270,
};
