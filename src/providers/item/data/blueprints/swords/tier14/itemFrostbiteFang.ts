import { IEquippableMeleeTier14WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemFrostbiteFang: IEquippableMeleeTier14WeaponBlueprint = {
  key: SwordsBlueprint.FrostbiteFang,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/frostbite-fang.png",
  name: "Frostbite Fang",
  description:
    "Forged from the fang of an ancient ice wyrm, this blade radiates icy cold, freezing foes with every savage strike.",
  attack: 102,
  defense: 90,
  tier: 14,
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 230,
};
