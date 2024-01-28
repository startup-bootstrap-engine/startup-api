import { IEquippableMeleeTier10WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemTwinFangClub: IEquippableMeleeTier10WeaponBlueprint = {
  key: MacesBlueprint.TwinFangClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/twin-fang-club.png",
  name: "Twin Fang Club",
  description: "Twin Fang Club perfectly encapsulates both the fierceness and descriptive essence of the weapon.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 72,
  defense: 63,
  tier: 10,
  rangeType: EntityAttackType.Melee,
};
