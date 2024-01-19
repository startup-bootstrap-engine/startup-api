import { IEquippableMeleeTier7WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemMetalMasherClub: IEquippableMeleeTier7WeaponBlueprint = {
  key: MacesBlueprint.MetalMasherClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/metal-masher-club.png",
  name: "Metal Masher Club",
  description: "Metal Masher emphasizes the weapon's proficiency in crushing and pulverizing.",
  weight: 4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 57,
  defense: 40,
  tier: 7,
  rangeType: EntityAttackType.Melee,
};
