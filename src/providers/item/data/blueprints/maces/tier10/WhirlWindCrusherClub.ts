import { IEquippableMeleeTier10WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemWhirlWindCrusherClub: IEquippableMeleeTier10WeaponBlueprint = {
  key: MacesBlueprint.WhirlWindCrusherClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/whirl-wind-crusher-club.png",
  name: "Whirl Wind Crusher Club",
  description: "Twin Fang Club perfectly encapsulates both the fierceness and descriptive essence of the weapon.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 73,
  defense: 69,
  tier: 10,
  rangeType: EntityAttackType.Melee,
};
