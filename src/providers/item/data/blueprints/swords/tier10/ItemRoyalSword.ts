import { IEquippableMeleeTier10WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemRoyalSword: IEquippableMeleeTier10WeaponBlueprint = {
  key: SwordsBlueprint.RoyalSword,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/royal-sword.png",
  name: "royal-sword",
  description: "A royal sword is a weapon fit for a king, queen, or other noble ruler.",
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 75,
  defense: 50,
  tier: 10,
  rangeType: EntityAttackType.Melee,
};
