import { IEquippableMeleeTier9WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemStarfirMaulClub: IEquippableMeleeTier9WeaponBlueprint = {
  key: MacesBlueprint.StarfirMaulClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/starfir-maul-club.png",
  name: "Starfir Maul Club",
  description: "The Skull Crusher Club seamlessly merges stylish aesthetics with an ominous undertone.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 68,
  defense: 50,
  tier: 9,
  rangeType: EntityAttackType.Melee,
};
