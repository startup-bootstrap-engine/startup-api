import { IEquippableMeleeTier7WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemShatterSpikeClub: IEquippableMeleeTier7WeaponBlueprint = {
  key: MacesBlueprint.ShatterSpikeClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/shatterspike-club.png",
  name: "Shatter Spike Club",
  description: "The Shatterspike Club demonstrates its exceptional ability to both break and pierce through armor.",
  weight: 4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 56,
  defense: 50,
  tier: 7,
  rangeType: EntityAttackType.Melee,
};
