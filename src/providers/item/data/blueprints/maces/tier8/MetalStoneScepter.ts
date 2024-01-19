import { IEquippableMeleeTier8WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemMetalStoneScepter: IEquippableMeleeTier8WeaponBlueprint = {
  key: MacesBlueprint.MetalStoneScepter,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/metalstone-scepter.png",
  name: "Metal Stone Scepter",
  description: "Uniting metal and stone for unparalleled strength.",
  weight: 4.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 63,
  defense: 58,
  tier: 8,
  rangeType: EntityAttackType.Melee,
};
