import { IEquippableMeleeTier8WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemDragonScalCleaverClub: IEquippableMeleeTier8WeaponBlueprint = {
  key: MacesBlueprint.DragonScalCleaverClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/dragonscale-cleaver-club.png",
  name: "Dragon Scal Cleaver Club",
  description: "Dragonscale Cleaver emphasizes its remarkable effectiveness against even the toughest scales.",
  weight: 4.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 62,
  defense: 54,
  tier: 8,
  rangeType: EntityAttackType.Melee,
};
