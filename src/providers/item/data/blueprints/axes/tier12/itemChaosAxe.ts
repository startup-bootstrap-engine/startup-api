import { IEquippableMeleeTier12WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemChaosAxe: IEquippableMeleeTier12WeaponBlueprint = {
  key: AxesBlueprint.ChaosAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/chaos-axe.png",
  name: "Chaos Axe",
  description: "The Chaos Axe wields a twisted design, unpredictable power, symbolizing battlefield turmoil.",
  weight: 4.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 90,
  defense: 90,
  tier: 12,
  rangeType: EntityAttackType.Melee,
  basePrice: 116,
};
