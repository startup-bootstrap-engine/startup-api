import { IEquippableWeaponBlueprint, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { DaggersBlueprint } from "../../types/itemsBlueprintTypes";

export const itemHellishDagger: IEquippableWeaponBlueprint = {
  key: DaggersBlueprint.HellishDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/hellish-dagger.png",
  name: "Hellish Dagger",
  description:
    "A small knife imbued with dark, otherworldly energy. It is said to be able to ignite the air around it and to be capable of cutting through even the toughest materials with ease.",
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 16,
  defense: 6,
  rangeType: EntityAttackType.Melee,
  basePrice: 57,
};
