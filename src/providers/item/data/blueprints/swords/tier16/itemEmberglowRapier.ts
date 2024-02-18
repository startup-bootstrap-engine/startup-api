import { IEquippableMeleeTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemEmberglowRapier: IEquippableMeleeTier16WeaponBlueprint = {
  key: SwordsBlueprint.EmberglowRapier,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/emberglow-rapier.png",
  name: "Emberglow Rapier",
  description:
    "Infused with the essence of fire, this rapier dances with flickering flames, piercing through armor with fiery precision.",
  attack: 117,
  defense: 90,
  tier: 16,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 240,
};
