import { IEquippableMeleeTier12WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemThunderstrikeAxe: IEquippableMeleeTier12WeaponBlueprint = {
  key: AxesBlueprint.ThunderstrikeAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/thunderstrike-axe.png",
  name: "Thunderstrike Axe",
  description: "An axe infused with the fury of thunder, striking foes with lightning speed.",
  weight: 4.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 87,
  defense: 88,
  tier: 12,
  rangeType: EntityAttackType.Melee,
  basePrice: 125,
};
