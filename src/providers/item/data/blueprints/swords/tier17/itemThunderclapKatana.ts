import { IEquippableMeleeTier17WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemThunderclapKatana: IEquippableMeleeTier17WeaponBlueprint = {
  key: SwordsBlueprint.ThunderclapKatana,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/thunderclap-katana.png",
  name: "Thunderclap Katana",
  description:
    "Tempest forged into steel, this katana unleashes thunderous strikes, shaking the very ground with its powerful blows.",
  attack: 124,
  defense: 100,
  tier: 17,
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 270,
};
