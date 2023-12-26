import { IEquippableMeleeTier5WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemJianSword: IEquippableMeleeTier5WeaponBlueprint = {
  key: SwordsBlueprint.JianSword,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/jian-sword.png",
  name: "jian-sword",
  description:
    "The Jian sword is a traditional Chinese weapon that has been used for centuries by warriors and martial artists alike.",
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 35,
  defense: 20,
  rangeType: EntityAttackType.Melee,
  tier: 5,
};
