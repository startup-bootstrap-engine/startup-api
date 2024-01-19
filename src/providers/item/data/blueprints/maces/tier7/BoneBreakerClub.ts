import { IEquippableMeleeTier7WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemBoneBreakerClub: IEquippableMeleeTier7WeaponBlueprint = {
  key: MacesBlueprint.BoneBreakerClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/bonebreaker-club.png",
  name: "Bone Break Club",
  description: "The Bonebreaker Club highlights the weapon's capacity to effectively break bones.",
  weight: 4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 56,
  defense: 32,
  tier: 7,
  rangeType: EntityAttackType.Melee,
};
