import { IEquippableMeleeTier18WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCrownSplitterAxe: IEquippableMeleeTier18WeaponBlueprint = {
  key: AxesBlueprint.CrownSplitterAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/crown-splitter-axe.png",
  name: "Crown Splitter Axe",
  description: "Heavy, sharp axe. Strong for fighting. Looks tough.",
  weight: 6.1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 130,
  defense: 126,
  tier: 18,
  rangeType: EntityAttackType.Melee,
  basePrice: 160,
};
