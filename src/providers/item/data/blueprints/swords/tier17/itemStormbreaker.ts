import { IEquippableMeleeTier17WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemStormbreaker: IEquippableMeleeTier17WeaponBlueprint = {
  key: SwordsBlueprint.Stormbreaker,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/stormbreaker.png",
  name: "Stormbreaker",
  description:
    "Reflecting the speed of thunder and lightning, this sword brings down the wrath from the heavens upon its enemies.",
  attack: 125,
  defense: 99,
  tier: 17,
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 220,
};
