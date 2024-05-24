import { IEquippableMeleeTier11WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemZephyrBlade: IEquippableMeleeTier11WeaponBlueprint = {
  key: SwordsBlueprint.ZephyrBlade,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/zephyr-blade.png",
  name: "Zephyr Blade",
  description:
    "Crafted from the feathers of ancient avian creatures, this blade dances with the wind, striking with unmatched speed and agility.",
  attack: 82,
  defense: 78,
  tier: 11,
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 250,
};
