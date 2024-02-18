import { IEquippableMeleeTier18WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemInfernoCleaver: IEquippableMeleeTier18WeaponBlueprint = {
  key: SwordsBlueprint.InfernoCleaver,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/inferno-cleaver.png",
  name: "Inferno Cleaver",
  description:
    "Forged in the depths of hell, this cleaver sears through armor with infernal heat, leaving enemies scorched and smoldering.",
  attack: 130,
  defense: 100,
  tier: 18,
  weight: 1.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 275,
};
