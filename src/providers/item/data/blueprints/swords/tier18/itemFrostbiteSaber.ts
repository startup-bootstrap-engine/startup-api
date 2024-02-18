import { IEquippableMeleeTier18WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemFrostbiteSaber: IEquippableMeleeTier18WeaponBlueprint = {
  key: SwordsBlueprint.FrostbiteSaber,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/frostbite-saber.png",
  name: "Frostbite Saber",
  description:
    "Echoing the sharp coldness of ice, this saber chills enemies to the bone, leaving them frozen in their tracks.",
  attack: 130,
  defense: 95,
  tier: 18,
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 240,
};
