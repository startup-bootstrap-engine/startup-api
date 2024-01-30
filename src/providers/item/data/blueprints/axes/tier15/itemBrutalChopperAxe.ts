import { IEquippableMeleeTier15WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemBrutalChopperAxe: IEquippableMeleeTier15WeaponBlueprint = {
  key: AxesBlueprint.BrutalChopperAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/brutal-chopper-axe.png",
  name: "Brutal Chopper Axe",
  description: "Ruthlessly designed for powerful and unforgiving strikes.",
  weight: 5.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 107,
  defense: 105,
  tier: 15,
  rangeType: EntityAttackType.Melee,
  basePrice: 132,
};
