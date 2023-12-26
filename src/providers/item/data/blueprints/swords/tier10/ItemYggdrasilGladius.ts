import { IEquippableMeleeTier10WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemYggdrasilGladius: IEquippableMeleeTier10WeaponBlueprint = {
  key: SwordsBlueprint.YggdrasilGladius,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/yggdrasil-gladius.png",
  name: "Yggdrasil Gladius",
  description: "Crafted from the sturdy wood of Yggdrasil, this gladius sword was unlike any other.",
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 78,
  tier: 10,
  defense: 72,
  rangeType: EntityAttackType.Melee,
};
