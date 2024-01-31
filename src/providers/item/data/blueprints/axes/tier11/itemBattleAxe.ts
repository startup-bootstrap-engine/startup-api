import { IEquippableMeleeTier11WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemBattleAxe: IEquippableMeleeTier11WeaponBlueprint = {
  key: AxesBlueprint.BattleAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/battle-axe.png",
  name: "Battle Axe",
  description: "Formidable battle axe, double-edged blade, sturdy haft, symbol of strength.",
  weight: 3.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 85,
  defense: 85,
  tier: 11,
  rangeType: EntityAttackType.Melee,
  basePrice: 107,
};
