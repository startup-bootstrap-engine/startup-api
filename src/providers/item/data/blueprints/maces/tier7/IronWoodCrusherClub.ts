import { IEquippableMeleeTier7WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemIronWoodCrusherClub: IEquippableMeleeTier7WeaponBlueprint = {
  key: MacesBlueprint.IronWoodCrusherClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/ironwood-crusher-club.png",
  name: "Iron Wood Crusher Club",
  description: "The Ironwood Crusher accentuates the powerful fusion of robust wood and destructive iron.",
  weight: 4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 57,
  defense: 37,
  tier: 7,
  rangeType: EntityAttackType.Melee,
};
