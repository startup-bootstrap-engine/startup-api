import { IEquippableMeleeTier13WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemFrostbiteCleaver: IEquippableMeleeTier13WeaponBlueprint = {
  key: AxesBlueprint.FrostbiteCleaver,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/frostbite-cleaver.png",
  name: "Frostbite Cleaver",
  description: "An axe imbued with the icy chill of winter, freezing foes on impact.",
  weight: 3.9,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 97,
  defense: 95,
  tier: 13,
  rangeType: EntityAttackType.Melee,
  basePrice: 130,
};
