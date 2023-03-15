import { EntityAttackType, IEquippableWeaponBlueprint, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemEnchantedSword: IEquippableWeaponBlueprint = {
  key: SwordsBlueprint.EnchantedSword,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/enchanted-sword.png",
  name: "Enchanted Sword",
  description:
    "A magical sword imbued with powerful enchantments, capable of channeling potent spells and incantations.",
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 14,
  defense: 7,
  rangeType: EntityAttackType.Melee,
  basePrice: 78,
};
