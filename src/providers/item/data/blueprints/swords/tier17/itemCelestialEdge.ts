import { IEquippableMeleeTier17WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCelestialEdge: IEquippableMeleeTier17WeaponBlueprint = {
  key: SwordsBlueprint.CelestialEdge,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/celestial-edge.png",
  name: "Celestial Edge",
  description:
    "Forged from celestial fragments, this blade glows with the radiance of the heavens, striking foes with divine precision.",
  attack: 121,
  defense: 89,
  tier: 17,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 230,
};
